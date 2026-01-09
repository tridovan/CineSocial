package com.cine.social.identity.service;


import com.cine.social.identity.dto.request.AuthenticationRequest;
import com.cine.social.identity.dto.request.UserCreationRequest;
import com.cine.social.identity.dto.response.AuthenticationResponse;
import com.cine.social.identity.dto.response.UserResponse;

public interface AuthService {
    AuthenticationResponse authenticate(AuthenticationRequest request);
    UserResponse register(UserCreationRequest request);

    AuthenticationResponse outboundAuthenticate(String code);
}
