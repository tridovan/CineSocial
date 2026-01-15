package com.cine.social.post.service.impl;

import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.event.UserFollowOutboxEvent;
import com.cine.social.post.entity.UserFollow;
import com.cine.social.post.repository.UserFollowRepository;
import com.cine.social.post.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProfileConsumerService {
    private final UserProfileRepository userProfileRepository;
    private final UserFollowRepository userFollowRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "PROFILE_UPDATED",
            groupId = "post-service-group",
            containerFactory = "debeziumListenerContainerFactory"
    )
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
            int count = userProfileRepository.updateProfileIfExists(event);
            log.info("Update successfully  count: {} ", count);

        } catch (Exception e) {
            log.error("Error syncing profile", e);
        }
    }

    @KafkaListener(
            topics = "USER_FOLLOW_UPDATED",
            groupId = "post-service-follow-group",
            containerFactory = "debeziumListenerContainerFactory"
    )
    @Transactional
    public void handleUserFollowUpdate(String message) {
        log.info("Receive follow update message {} ", message);
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            UserFollowOutboxEvent event;
            if(rootNode.has("payload") && rootNode.get("payload").isTextual()){
                String payloadJson = rootNode.get("payload").asText();
                event = objectMapper.readValue(payloadJson, UserFollowOutboxEvent.class);
            }else{
                event = objectMapper.readValue(message, UserFollowOutboxEvent.class);
            }

            if ("FOLLOW".equals(event.getAction())) {
                if (userFollowRepository.findByFollowerIdAndFollowedId(event.getFollowerId(), event.getFollowedId()).isEmpty()) {
                    UserFollow userFollow = UserFollow.builder()
                            .followerId(event.getFollowerId())
                            .followedId(event.getFollowedId())
                            .build();
                    userFollowRepository.save(userFollow);
                    log.info("Created user follow: {} -> {}", event.getFollowerId(), event.getFollowedId());
                }
            } else if ("UNFOLLOW".equals(event.getAction())) {
                userFollowRepository.deleteByFollowerIdAndFollowedId(event.getFollowerId(), event.getFollowedId());
                log.info("Deleted user follow: {} -> {}", event.getFollowerId(), event.getFollowedId());
            }

        } catch (Exception e) {
            log.error("Error syncing user follow", e);
        }
    }
}
