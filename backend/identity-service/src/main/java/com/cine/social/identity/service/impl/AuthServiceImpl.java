package com.cine.social.identity.service.impl;

import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import com.cine.social.identity.constant.PredefinedRole;
import com.cine.social.identity.dto.request.AuthenticationRequest;
import com.cine.social.identity.dto.request.ExchangeTokenRequest;
import com.cine.social.identity.dto.request.UserCreationRequest;
import com.cine.social.identity.dto.response.AuthenticationResponse;
import com.cine.social.identity.dto.response.OutboundUserResponse;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.entity.Role;
import com.cine.social.identity.entity.User;
import com.cine.social.identity.constant.IdentityErrorCode;
import com.cine.social.identity.httpclient.OutboundIdentityClient;
import com.cine.social.identity.httpclient.OutboundUserClient;
import com.cine.social.identity.mapper.UserMapper;
import com.cine.social.identity.property.JwtProperties;
import com.cine.social.identity.property.OAuthProperties;
import com.cine.social.identity.repository.RoleRepository;
import com.cine.social.identity.repository.UserRepository;
import com.cine.social.identity.service.AuthService;
import com.cine.social.identity.service.UserService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final OutboundIdentityClient outboundIdentityClient;
    private final OAuthProperties oAuthProperties;
    private final OutboundUserClient outboundUserClient;
    private final UserService userService;

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(IdentityErrorCode.EMAIL_NOT_EXISTED)
        );
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getId(),
                        request.getPassword()
                )
        );
        if(!authentication.isAuthenticated()){
            throw new AppException(CommonErrorCode.UNAUTHENTICATED);
        }

        String token = generateToken(authentication);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .roles(authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                .build();

    }

    private String generateToken(Authentication authentication) {
        return generateToken(authentication.getName(), authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" ")));
    }

    private String generateToken(User user) {
        return generateToken(user.getId(), user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.joining(" ")));
    }

    private String generateToken(String subject, String scope) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(subject)
                .issuer(jwtProperties.getIssuer())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(jwtProperties.getValidDurationInSecond(), ChronoUnit.SECONDS).toEpochMilli()
                ))
                .claim("scp", scope)
                .build();

        SignedJWT signedJWT = new SignedJWT(header, jwtClaimsSet);

        try {
            JWSSigner signer = new MACSigner(jwtProperties.getSignerKey().getBytes());
            signedJWT.sign(signer);
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new AppException(IdentityErrorCode.CAN_NOT_CREATE_JWT_TOKEN);
        }
    }

    @Override
    public UserResponse register(UserCreationRequest request) {
        if(userRepository.existsByEmail(request.email())){
            throw new AppException(IdentityErrorCode.EXISTED_EMAIL);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);
        var savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthenticationResponse outboundAuthenticate(String code){
        var response = outboundIdentityClient.exchangeToken(ExchangeTokenRequest.builder()
                .code(code)
                .clientId(oAuthProperties.getClientId())
                .clientSecret(oAuthProperties.getClientSecret())
                .redirectUri(oAuthProperties.getRedirectUri())
                .grantType(oAuthProperties.getGrantType())
                .build());

        OutboundUserResponse userInfo = outboundUserClient.getUserInfo("json", response.getAccessToken());
        User user = userRepository.findByEmail(userInfo.getEmail()).orElseGet(
                () -> processNewOauthUser(userInfo));

        if(!StringUtils.hasText(user.getImgUrl())){
            user.setImgUrl(userInfo.getPicture());
            userService.createUpdatedProfileEventAndSaveOutbox(user);
        }

        String token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    private User processNewOauthUser(OutboundUserResponse userInfo) {
        String temporaryPassword = "12345678";
        User newUser = createUserForFirstTimeUsingOauth2Login(userInfo, temporaryPassword);
        return newUser;
    }

    private User createUserForFirstTimeUsingOauth2Login(OutboundUserResponse userInfo, String temporaryPassword){
        Set<Role> roles = new HashSet<>();
        roles.add(Role.builder().name(PredefinedRole.USER_ROLE).build());

        User user = User.builder()
                .email(userInfo.getEmail())
                .password(passwordEncoder.encode(temporaryPassword))
                .firstName(userInfo.getGivenName())
                .lastName(userInfo.getFamilyName())
                .imgUrl(userInfo.getPicture())
                .roles(roles)
                .build();
        User savedUser = userRepository.save(user);
        return savedUser;
    }
}
