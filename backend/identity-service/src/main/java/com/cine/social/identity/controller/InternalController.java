package com.cine.social.identity.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalController {

    private final UserService userService;


    @PostMapping("/users/fetch")
    ApiResponse<List<UserResponse>> getBatchUsersInfo(@RequestBody List<String> ids) {
        return ApiResponse.success(userService.getUsersInfo(ids));
    }
}