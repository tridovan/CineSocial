package com.cine.social.identity.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.identity.dto.request.AuthenticationRequest;
import com.cine.social.identity.dto.request.UserCreationRequest;
import com.cine.social.identity.dto.response.AuthenticationResponse;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.service.AuthService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authService.authenticate(request);
        return ApiResponse.success(result);
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserCreationRequest request) {
        return ApiResponse.success(authService.register(request));
    }


    @PostMapping("/outbound/authentication")
    ApiResponse<AuthenticationResponse> outboundAuthenticate(@RequestParam("code") String code){
        AuthenticationResponse result = authService.outboundAuthenticate(code);
        return ApiResponse.success(result);
    }


}
