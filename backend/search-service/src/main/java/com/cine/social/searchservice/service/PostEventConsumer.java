package com.cine.social.searchservice.service;


import com.cine.social.event.PostOutboxEvent;
import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.searchservice.entity.PostDocument;
import com.cine.social.searchservice.repository.PostSearchRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostEventConsumer {

    private final PostSearchRepository postSearchRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "UPSERT_POST", groupId = "search-service-group")
    public void listenPostUpserted(String message) {

        log.info("Received event UPSERT_POST: {}", message);
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            PostOutboxEvent event;

            if(rootNode.has("payload") && rootNode.get("payload").isTextual()){
                String payloadJson = rootNode.get("payload").asText();
                event = objectMapper.readValue(payloadJson, PostOutboxEvent.class);
            }else{
                event = objectMapper.readValue(message, PostOutboxEvent.class);
            }
            upsertPostDocument(event);


        } catch (Exception e) {
            log.error("Failed to sync post to Elastic", e);
        }

    }

    @KafkaListener(topics = "DELETE_POST", groupId = "search-service-group")
    public void listenPostDeleted(String message) {

        log.info("Received event POST_DELETED: {}", message);
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            String documentId = null;

            if(rootNode.has("payload") && rootNode.get("payload").isTextual()){
                String payloadJson = rootNode.get("payload").asText();
                JsonNode payloadNode = objectMapper.readTree(payloadJson);
                if(payloadNode.has("id")){
                    documentId = payloadNode.get("id").asText();
                }
            } else if (rootNode.has("aggregateId")) {
                documentId = rootNode.get("aggregateId").asText();
            }

            if(StringUtils.hasText(documentId)) {
                postSearchRepository.deleteById(documentId);
            }

        } catch (Exception e) {
            log.error("Failed to sync post to Elastic", e);
        }

    }


    private void upsertPostDocument(PostOutboxEvent event){
        PostDocument postDocument = PostDocument.builder()
                .id(event.getId())
                .title(event.getTitle())
                .content(event.getContent())
                .resourceUrl(event.getResourceUrl())
                .resourceType(event.getResourceType())
                .authorId(event.getAuthorId())
                .authorName(event.getAuthorName())
                .authorAvatar(event.getAuthorAvatar())
                .commentCount(event.getCommentCount())
                .voteCount(event.getVoteCount())
                .build();
        
        if (StringUtils.hasText(event.getCreatedAt())) {
            try {
                postDocument.setCreatedAt(Date.from(LocalDateTime.parse(event.getCreatedAt()).toInstant(ZoneOffset.UTC)));
            } catch (Exception e) {
                log.error("Failed to parse createdAt for post {}: {}", event.getId(), event.getCreatedAt());
            }
        }
        postSearchRepository.save(postDocument);
        log.info("Success to save post {}: {}", event.getId(), event.getCreatedAt());
    }
}
