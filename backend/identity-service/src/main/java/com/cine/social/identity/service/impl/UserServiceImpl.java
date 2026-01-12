package com.cine.social.identity.service.impl;



import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.identity.dto.request.UserUpdateRequest;
import com.cine.social.identity.dto.response.UserResponse;
import com.cine.social.identity.entity.User;
import com.cine.social.identity.mapper.UserMapper;
import com.cine.social.identity.repository.UserRepository;
import com.cine.social.identity.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserMapper userMapper;

    public UserResponse getMyProfile() {
        String currentId = SecurityUtils.getCurrentUserId();
        return userMapper.toResponse(findUserByIdlOrThrowException(currentId));
    }

    @Override
    public UserResponse updateProfile(String id, UserUpdateRequest request) {
        User user = findUserByIdlOrThrowException(id);
        userMapper.updateUser(user, request);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    private User findUserByIdlOrThrowException(String id){
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(CommonErrorCode.USER_NOT_FOUND));
    }



}
