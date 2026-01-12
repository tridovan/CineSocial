package com.cine.social.identity.service;

import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.entity.OutboxEvent;
import com.cine.social.identity.entity.User;
import com.fasterxml.jackson.core.JsonProcessingException;


public interface UserService {
    UserResponse getMyProfile();

    UserResponse updateProfile(String id, UserUpdateRequest request);

    void createUpdatedProfileEventAndSaveOutbox(User user);
}
