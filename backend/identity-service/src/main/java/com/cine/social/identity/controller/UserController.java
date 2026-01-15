package com.cine.social.identity.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.dto.response.UserWallProfileResponse;
import com.cine.social.identity.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/me")
    ApiResponse<UserResponse> getMyInfo(){;
        return ApiResponse.success(userService.getMyProfile());

    }

    @GetMapping("/{id}")
    ApiResponse<UserResponse> getInfo(@PathVariable String id){;
        return ApiResponse.success(userService.getProfile(id));

    }

    @GetMapping("/{id}/wall")
    ApiResponse<UserWallProfileResponse> getUserProfile(@PathVariable String id){;
        return ApiResponse.success(userService.getUserWallProfile(id));

    }

    @PutMapping("/{id}")
    ApiResponse<UserResponse> updateProfile(@PathVariable String id, @RequestBody UserUpdateRequest request){;
        return ApiResponse.success(userService.updateProfile(id, request));

    }

    @PostMapping("/{id}/follow")
    ApiResponse<Void> followUser(@PathVariable String id){
        userService.followUser(id);
        return ApiResponse.successWithMessage("Follow successfully");
    }

    @PostMapping("/{id}/unfollow")
    ApiResponse<Void> unfollowUser(@PathVariable String id){
        userService.unfollowUser(id);
        return ApiResponse.successWithMessage("Unfollow successfully");
    }

    @GetMapping("/me/following")
    ApiResponse<List<UserResponse>> getMyFollowedUsers(){
        return ApiResponse.success(userService.getMyFollowedUsers());
    }

    @GetMapping("/search")
    ApiResponse<List<UserWallProfileResponse>> searchUsers(@RequestParam String keyword){
        return ApiResponse.success(userService.searchUsers(keyword));
    }

}