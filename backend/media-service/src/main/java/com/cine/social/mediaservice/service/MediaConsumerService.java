package com.cine.social.mediaservice.service;


import com.cine.social.event.MediaProcessedEvent;
import com.cine.social.event.PostCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
    public class MediaConsumerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Tên topic phải khớp với Post Service
    @KafkaListener(topics = "post-created-topic", groupId = "media-group")
    public void handlePostCreated(PostCreatedEvent event) {
        log.info("Received event for Post ID: {}", event.getPostId());

        try {
            if (event.getResourceUrl().contains("error")) {
                throw new RuntimeException("Simulated FFmpeg Error!");
            }

            log.info("Starting video encoding for: {}", event.getResourceUrl());

            // Giả vờ nén mất 5 giây
            Thread.sleep(5000);

            // Giả sử nén xong, ta có link mới (ví dụ thêm prefix 'processed_')
            String processedUrl = event.getResourceUrl().replace("raw", "processed");

            log.info("Video encoding completed. Sending success event.");

            // Bắn sự kiện "Xong rồi" ngược lại Kafka
            sendEvent(event.getPostId(), "DONE", processedUrl);

        } catch (Exception e) {
            log.error("Video processing failed for Post ID: {}", event.getPostId(), e);

            // Nếu lỗi -> Bắn sự kiện Failed
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