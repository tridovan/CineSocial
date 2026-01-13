package com.cine.social.chatservice.mapper;

import com.cine.social.chatservice.dto.response.UserResponse;
import com.cine.social.chatservice.entity.UserProfile;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserResponse toResponse(UserProfile entity);
    List<UserResponse> toListResponses(List<UserProfile> entities);
}
