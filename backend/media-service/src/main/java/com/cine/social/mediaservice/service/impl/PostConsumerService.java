package com.cine.social.mediaservice.service.impl;


import com.cine.social.event.MediaProcessedEvent;
import com.cine.social.event.PostCreatedEvent;
import com.cine.social.mediaservice.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
    public class PostConsumerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final VideoService videoService;

    @KafkaListener(topics = "post-created-topic", groupId = "media-group")
    public void handlePostCreated(PostCreatedEvent event) {
        log.info("Received event for Post ID: {}", event.getPostId());

        try {
            String processedUrl = videoService.processVideo(event.getResourceUrl());
            log.info("Video processing DONE. New URL: {}", processedUrl);
            sendEvent(event.getPostId(), "DONE", processedUrl);

        } catch (Exception e) {
            log.error("Video processing failed for Post ID: {}", event.getPostId(), e);
            sendEvent(event.getPostId(), "FAILED", null);
        }

    }

    private void sendEvent(String postId, String status, String url) {
        MediaProcessedEvent resultEvent = MediaProcessedEvent.builder()
                .postId(postId)
                .status(status)
                .processedUrl(url)
                .build();
        kafkaTemplate.send("media-processed-topic", resultEvent);
    }
}