package com.cine.social.post.mapper;

import com.cine.social.post.dto.response.UserResponse;
import com.cine.social.post.entity.UserProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserResponse toResponse(UserProfile userProfile);
}
