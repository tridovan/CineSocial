package com.cine.social.chatservice.service.impl;

import com.cine.social.chatservice.dto.response.UserResponse;
import com.cine.social.chatservice.entity.UserProfile;
import com.cine.social.chatservice.httpclient.IdentityClient;
import com.cine.social.chatservice.mapper.UserProfileMapper;
import com.cine.social.chatservice.repository.UserProfileRepository;
import com.cine.social.chatservice.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final IdentityClient identityClient;
    private final UserProfileMapper userProfileMapper;



    @Override
    public void ensureUserProfilesExists(List<String> userIds) {
        List<String> existedIds = userProfileRepository.findAllById(userIds).stream().map(UserProfile::getId).toList();
        if(!existedIds.isEmpty()) {
            userIds.removeAll(existedIds);
        }
        try {
            var response = identityClient.getBatchUsersInfo(userIds);
            if (Objects.nonNull(response)  && Objects.nonNull(response.getData()) ) {
                List<UserResponse> profilesData = response.getData();

                List<UserProfile> usersProfile = userProfileMapper.toListEntities(profilesData);

                userProfileRepository.saveAll(usersProfile);
            }
        } catch (Exception e) {
            log.error("Failed to fetch user profile for  {}", userIds, e);
        }
    }
}
