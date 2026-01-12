package com.cine.social.identity.service.impl;



import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.entity.OutboxEvent;
import com.cine.social.identity.entity.User;
import com.cine.social.identity.mapper.UserMapper;
import com.cine.social.identity.repository.OutboxEventRepository;
import com.cine.social.identity.repository.UserRepository;
import com.cine.social.identity.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    ObjectMapper objectMapper;
    OutboxEventRepository outboxEventRepository;

    public UserResponse getMyProfile() {
        String currentId = SecurityUtils.getCurrentUserId();
        return userMapper.toResponse(findUserByIdlOrThrowException(currentId));
    }

    @Override
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

        try {
            OutboxEvent outbox = OutboxEvent.builder()
                    .aggregateType("USER")
                    .aggregateId(user.getId())
                    .type("PROFILE_UPDATED")
                    .payload(objectMapper.writeValueAsString(eventPayload))
                    .build();
            OutboxEvent saveEvent = outboxEventRepository.save(outbox);
            log.info("Save outbox event {}", saveEvent.getId());
        } catch (Exception e) {
            log.error("Error serializing outbox payload", e);
        }

    }

    @Override
    public UserResponse getProfile(String userId) {
        return userMapper.toResponse(findUserByIdlOrThrowException(userId));
    }

    private User findUserByIdlOrThrowException(String id){
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(CommonErrorCode.USER_NOT_FOUND));
    }





}
