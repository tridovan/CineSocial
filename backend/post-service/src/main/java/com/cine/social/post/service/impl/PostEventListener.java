package com.cine.social.post.service.impl;

import com.cine.social.event.MediaProcessedEvent;
import com.cine.social.post.constant.PostStatus;
import com.cine.social.post.entity.Post;
import com.cine.social.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostEventListener {

    private final PostRepository postRepository;

    @KafkaListener(topics = "media-processed-topic", groupId = "post-group")
    @Transactional
    public void handleMediaProcessed(MediaProcessedEvent event) {
        log.info("Received Media Processed Event for Post ID: {}, Status: {}", event.getPostId(), event.getStatus());

        Post post = postRepository.findById(event.getPostId()).orElse(null);
        if (post == null) {
            log.warn("Post not found for ID: {}", event.getPostId());
            return;
        }

        if ("DONE".equals(event.getStatus())) {
            post.setStatus(PostStatus.PUBLISHED);
            post.setResourceUrl(event.getProcessedUrl());
            log.info("Post {} published successfully with new URL: {}", post.getId(), event.getProcessedUrl());
        } else {
            post.setStatus(PostStatus.MEDIA_FAILED);
            log.error("Post {} failed to process media", post.getId());
        }

        postRepository.save(post);
    }
}