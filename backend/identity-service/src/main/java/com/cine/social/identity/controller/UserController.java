package com.cine.social.identity.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/me")
    ApiResponse<UserResponse> getMyInfo(){;
        return ApiResponse.success(userService.getMyProfile());

    }

    @PutMapping("/{id}")
    ApiResponse<UserResponse> updateProfile(@PathVariable String id, @RequestBody UserUpdateRequest request){;
        return ApiResponse.success(userService.updateProfile(id, request));

    }

}