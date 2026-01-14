package com.cine.social.notificationservice.service;


import com.cine.social.event.NotificationEvent;
import com.cine.social.notificationservice.enitty.Notification;
import com.cine.social.notificationservice.mapper.NotificationMapper;
import com.cine.social.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {
    private final NotificationRepository notificationRepository;
    private final SseService sseService;
    private final NotificationMapper notificationMapper;


    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void handleNotificationEvent(NotificationEvent event){
        Notification notification = notificationMapper.toEntity(event);
        Notification savedNotification = notificationRepository.save(notification);

        sseService.sendNotification(event.getRecipientId(), savedNotification);
    }
}
