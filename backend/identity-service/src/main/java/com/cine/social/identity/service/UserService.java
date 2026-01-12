package com.cine.social.identity.service;

import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;


public interface UserService {
    UserResponse getMyProfile();

    UserResponse updateProfile(String id, UserUpdateRequest request);
}
