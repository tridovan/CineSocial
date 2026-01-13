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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final IdentityClient identityClient;
    private final UserProfileMapper userProfileMapper;



    @Override
    public void ensureUserProfilesExists(List<String> userIds) {
        if (Objects.isNull(userIds) || userIds.isEmpty()) {
            return;
        }

        List<String> toFetch = new ArrayList<>(userIds);

        List<String> existedIds = userProfileRepository.findAllById(toFetch)
                .stream()
                .map(UserProfile::getId)
                .collect(Collectors.toList());

        if (!existedIds.isEmpty()) {
            toFetch.removeAll(existedIds);
        }

        if (toFetch.isEmpty()) {
            return;
        }

        try {
            var response = identityClient.getBatchUsersInfo(toFetch);
            if (Objects.nonNull(response) && Objects.nonNull(response.getData())) {
                List<UserResponse> profilesData = response.getData();
                List<UserProfile> usersProfile = userProfileMapper.toListEntities(profilesData);
                userProfileRepository.saveAll(usersProfile);
            }
        } catch (Exception e) {
            log.error("Failed to fetch user profile for  {}", toFetch, e);
        }
    }
}
