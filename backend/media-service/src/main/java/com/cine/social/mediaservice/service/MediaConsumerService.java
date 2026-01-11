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
            // GIẢ LẬP QUÁ TRÌNH NÉN VIDEO (SIMULATION)
            // Vì tích hợp FFmpeg thật rất dễ lỗi môi trường, ở bước này ta giả lập trước
            // để đảm bảo Saga flow chạy thông suốt.

            log.info("Starting video encoding for: {}", event.getResourceUrl());

            // Giả vờ nén mất 5 giây
            Thread.sleep(5000);

            // Giả sử nén xong, ta có link mới (ví dụ thêm prefix 'processed_')
            String processedUrl = event.getResourceUrl().replace("raw", "processed");

            log.info("Video encoding completed. Sending success event.");

            // Bắn sự kiện "Xong rồi" ngược lại Kafka
            MediaProcessedEvent successEvent = MediaProcessedEvent.builder()
                    .postId(event.getPostId())
                    .status("DONE")
                    .processedUrl(processedUrl)
                    .build();

            kafkaTemplate.send("media-processed-topic", successEvent);

        } catch (InterruptedException e) {
            log.error("Video processing failed for Post ID: {}", event.getPostId(), e);

            // Nếu lỗi -> Bắn sự kiện Failed
            MediaProcessedEvent failedEvent = MediaProcessedEvent.builder()
                    .postId(event.getPostId())
                    .status("FAILED")
                    .build();
            kafkaTemplate.send("media-processed-topic", failedEvent);
        }
    }
}