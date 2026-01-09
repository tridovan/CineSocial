package com.cine.social.identity.service.impl;



import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.entity.User;
import com.cine.social.identity.mapper.UserMapper;
import com.cine.social.identity.repository.UserRepository;
import com.cine.social.identity.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserMapper userMapper;

    public UserResponse getMyProfile() {
        String email = getCurrentEmail();
        return userMapper.toResponse(findUserByEmailOrThrowException(email));
    }

    private User findUserByEmailOrThrowException(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(CommonErrorCode.USER_NOT_FOUND));
    }
    public String getCurrentEmail(){
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }




}
