package com.cine.social.identity.service.impl;



import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.event.UserFollowOutboxEvent;
import com.cine.social.identity.constant.IdentityErrorCode;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.dto.response.UserWallProfileResponse;
import com.cine.social.identity.entity.OutboxEvent;
import com.cine.social.identity.entity.User;
import com.cine.social.identity.entity.UserFollow;
import com.cine.social.identity.mapper.UserMapper;
import com.cine.social.identity.repository.OutboxEventRepository;
import com.cine.social.identity.repository.UserFollowRepository;
import com.cine.social.identity.repository.UserRepository;
import com.cine.social.identity.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserFollowRepository userFollowRepository;
    UserMapper userMapper;
    ObjectMapper objectMapper;
    OutboxEventRepository outboxEventRepository;

    public UserResponse getMyProfile() {
        String currentId = SecurityUtils.getCurrentUserId();
        return userMapper.toResponse(findUserByIdlOrThrowException(currentId));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String id, UserUpdateRequest request) {
        User user = findUserByIdlOrThrowException(id);
        userMapper.updateUser(user, request);
        User savedUser = userRepository.save(user);
        createUpdatedProfileEventAndSaveOutbox(savedUser);
        return userMapper.toResponse(user);
    }

    @Override
    public void createUpdatedProfileEventAndSaveOutbox(User user) {
        ProfileUpdatedEvent eventPayload = ProfileUpdatedEvent.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .imageUrl(user.getImgUrl())
                .build();

        saveOutboxEvent("USER", user.getId(), "PROFILE_UPDATED", eventPayload);
    }

    @Override
    public UserResponse getProfile(String userId) {
        return userMapper.toResponse(findUserByIdlOrThrowException(userId));
    }

    @Override
    public List<UserResponse> getUsersInfo(List<String> ids) {
        List<User> users = userRepository.findAllById(ids);
        return userMapper.toListResponses(users);
    }

    @Override
    @Transactional
    public void followUser(String targetId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        validateFollowAction(currentUserId, targetId);

        if(userFollowRepository.existsByFollowerIdAndFollowedId(currentUserId, targetId)) {
            return;
        }

        UserFollow follow = UserFollow.builder()
                .followerId(currentUserId)
                .followedId(targetId)
                .build();
        userFollowRepository.save(follow);

        UserFollowOutboxEvent event = UserFollowOutboxEvent.builder()
                .followerId(currentUserId)
                .followedId(targetId)
                .action("FOLLOW")
                .build();

        saveOutboxEvent("USER_FOLLOW", follow.getId(), "USER_FOLLOW_UPDATED", event);
    }

    @Override
    @Transactional
    public void unfollowUser(String targetId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        validateFollowAction(currentUserId, targetId);

        UserFollow follow = userFollowRepository.findByFollowerIdAndFollowedId(currentUserId, targetId)
                .orElse(null);
        
        if (Objects.isNull(follow)) {
            return;
        }

        userFollowRepository.delete(follow);

        UserFollowOutboxEvent event = UserFollowOutboxEvent.builder()
                .followerId(currentUserId)
                .followedId(targetId)
                .action("UNFOLLOW")
                .build();

        saveOutboxEvent("USER_FOLLOW", follow.getId(), "USER_FOLLOW_UPDATED", event);
    }

    @Override
    public List<UserResponse> getMyFollowedUsers() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        List<UserFollow> follows = userFollowRepository.findAllByFollowerId(currentUserId);
        
        List<String> followedUserIds = follows.stream()
                .map(UserFollow::getFollowedId)
                .toList();
        
        List<User> followedUsers = userRepository.findAllById(followedUserIds);
        return userMapper.toListResponses(followedUsers);
    }

    @Override
    public UserWallProfileResponse getUserWallProfile(String id) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        User user = findUserByIdlOrThrowException(id);
        boolean isFollowed = userFollowRepository.existsByFollowerIdAndFollowedId(currentUserId, user.getId());
        return UserWallProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .imgUrl(user.getImgUrl())
                .isFollowed(isFollowed)
                .build();

    }

    @Override
    public List<UserWallProfileResponse> searchUsers(String keyword) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        List<User> users = userRepository.searchUsers(keyword);
        
        List<UserFollow> follows = userFollowRepository.findAllByFollowerId(currentUserId);
        Set<String> followedUserIds = follows.stream()
                .map(UserFollow::getFollowedId)
                .collect(Collectors.toSet());

        return users.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> UserWallProfileResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .imgUrl(user.getImgUrl())
                        .isFollowed(followedUserIds.contains(user.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    private void validateFollowAction(String currentUserId, String targetId) {
        if(currentUserId.equals(targetId)) throw new AppException(IdentityErrorCode.CANNOT_FOLLOW_SELF);

        if (!userRepository.existsById(targetId)) {
            throw new AppException(CommonErrorCode.USER_NOT_FOUND);
        }
    }

    private void saveOutboxEvent(String aggregateType, String aggregateId, String type, Object payload) {
        try {
            OutboxEvent outbox = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .type(type)
                    .payload(objectMapper.writeValueAsString(payload))
                    .build();
            OutboxEvent saveEvent = outboxEventRepository.save(outbox);
            log.info("{} save outbox event {}", type, saveEvent.getId());
        } catch (Exception e) {
            log.error("Error serializing outbox payload for type {}", type, e);
            throw new AppException(CommonErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private User findUserByIdlOrThrowException(String id){
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(CommonErrorCode.USER_NOT_FOUND));
    }


}
