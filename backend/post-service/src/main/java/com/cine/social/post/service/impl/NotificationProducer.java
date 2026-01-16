package com.cine.social.post.service.impl;


import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.event.NotificationEvent;
import com.cine.social.post.entity.UserProfile;
import com.cine.social.post.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserProfileRepository userProfileRepository;
    private static final String NOTIFICATION_TOPIC = "notification-topic";

    public void createAndSendingNotificationEvent(String recipientId, String resourceId, String type, String message){
        String actorId = SecurityUtils.getCurrentUserId();

        UserProfile actorProfile = userProfileRepository.findById(actorId).orElseGet(UserProfile::new);
        String actorFirstName = Objects.nonNull(actorProfile.getFirstName()) ? actorProfile.getFirstName() : "";
        String actorLastName = Objects.nonNull(actorProfile.getLastName()) ? actorProfile.getLastName() : "";
        String actorName = "Cine Social";

        if(StringUtils.hasText(actorFirstName) || StringUtils.hasText(actorLastName)){
            actorName = String.format("%s %s", actorFirstName, actorLastName);
        }

        NotificationEvent event = NotificationEvent.builder()
                .actorId(actorId)
                .actorName(actorName)
                .actorImgUrl(actorProfile.getImgUrl())
                .recipientId(recipientId)
                .resourceId(resourceId)
                .type(type)
                .message(message)
                .build();

        sendNotificationEvent(event);


    }

    private void sendNotificationEvent(NotificationEvent notificationEvent){
      log.info("Sending notification event {}", notificationEvent.getMessage());
      kafkaTemplate.send(NOTIFICATION_TOPIC, notificationEvent);
    }


}
