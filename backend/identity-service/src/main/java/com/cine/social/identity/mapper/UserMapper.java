package com.cine.social.identity.mapper;

import com.cine.social.identity.dto.request.UserCreationRequest;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.entity.Role;
import com.cine.social.identity.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {
    @Mapping(target = "password", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toResponse(User user);

    List<UserResponse> toListResponses(List<User> users);

    void updateUser(@MappingTarget User entity, UserUpdateRequest request);


    default Set<String> map(Set<Role> roles) {
        if (Objects.isNull(roles)) return null;
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

}
