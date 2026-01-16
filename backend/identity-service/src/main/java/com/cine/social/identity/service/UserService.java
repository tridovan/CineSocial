package com.cine.social.identity.service;

import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.dto.response.UserWallProfileResponse;
import com.cine.social.identity.entity.User;

import java.util.List;


public interface UserService {
    UserResponse getMyProfile();

    UserResponse updateProfile(String id, UserUpdateRequest request);

    void createUpdatedProfileEventAndSaveOutbox(User user);

    UserResponse getProfile(String userId);

    List<UserResponse> getUsersInfo(List<String> ids);

    void followUser(String targetId);

    void unfollowUser(String targetId);

    List<UserResponse> getMyFollowedUsers();

    UserWallProfileResponse getUserWallProfile(String id);

    List<UserWallProfileResponse> searchUsers(String keyword);
}
