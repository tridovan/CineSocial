package com.cine.social.chatservice.service.impl;

import com.cine.social.chatservice.entity.UserProfile;
import com.cine.social.chatservice.repository.UserProfileRepository;
import com.cine.social.event.ProfileUpdatedEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProfileConsumerService {
    private final UserProfileRepository userProfileRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "PROFILE_UPDATED", groupId = "post-service-group")
    public void handleProfileUpdate(String message) {
        log.info("Receive message {} ", message);
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            ProfileUpdatedEvent event;
            if(rootNode.has("payload") && rootNode.get("payload").isTextual()){
                String payloadJson = rootNode.get("payload").asText();
                event = objectMapper.readValue(payloadJson, ProfileUpdatedEvent.class);
            }else{
                event = objectMapper.readValue(message, ProfileUpdatedEvent.class);
            }
            UserProfile userProfile = UserProfile.builder()
                    .id(event.getUserId())
                    .firstName(event.getFirstName())
                    .lastName(event.getLastName())
                    .imageUrl(event.getImageUrl())
                    .build();
            userProfileRepository.save(userProfile);

            log.info("Update successfully  count: {} ", event.getUserId());

        } catch (Exception e) {
            log.error("Error syncing profile", e);
        }
    }
}