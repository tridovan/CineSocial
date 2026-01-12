package com.cine.social.chatservice.service.impl;

import com.cine.social.chatservice.dto.response.UserResponse;
import com.cine.social.chatservice.entity.UserProfile;
import com.cine.social.chatservice.httpclient.IdentityClient;
import com.cine.social.chatservice.repository.UserProfileRepository;
import com.cine.social.chatservice.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final IdentityClient identityClient;


    @Override
    public void ensureUserProfileExists(String userId) {
        if(userProfileRepository.existsById(userId)){
            return;
        }
        log.info("User {} not found locally. Fetching from Identity Service...", userId);

        try {
            var response = identityClient.getProfile(userId);
            if (Objects.nonNull(response)  && Objects.nonNull(response.getData()) ) {
                UserResponse profileData = response.getData();

                UserProfile userProfile = UserProfile.builder()
                        .id(profileData.getId())
                        .firstName(profileData.getFirstName())
                        .lastName(profileData.getLastName())
                        .imageUrl(profileData.getImgUrl())
                        .build();

                userProfileRepository.save(userProfile);
            }
        } catch (Exception e) {
            log.error("Failed to fetch user profile for userId: {}", userId, e);
        }
    }
}
