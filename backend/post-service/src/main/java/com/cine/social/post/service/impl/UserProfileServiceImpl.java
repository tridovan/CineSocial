package com.cine.social.post.service.impl;

import com.cine.social.post.dto.response.UserResponse;
import com.cine.social.post.entity.UserProfile;
import com.cine.social.post.httpclient.IdentityClient;
import com.cine.social.post.repository.UserProfileRepository;
import com.cine.social.post.service.UserProfileService;
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
                        .imgUrl(profileData.getImgUrl())
                        .build();

                userProfileRepository.save(userProfile);
            }
        } catch (Exception e) {
            log.error("Failed to fetch user profile for userId: {}", userId, e);
        }
    }
}
