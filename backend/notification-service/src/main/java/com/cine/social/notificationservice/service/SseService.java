package com.cine.social.notificationservice.service;

import com.cine.social.common.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SseService {
     private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

     public SseEmitter subscribe(){
        String currentUserId = SecurityUtils.getCurrentUserId();

        SseEmitter sseEmitter = new SseEmitter(3600000L);
        emitters.put(currentUserId, sseEmitter);

         sseEmitter.onCompletion(() -> {
                     log.info("Sse {} complete", currentUserId);
                     emitters.remove(currentUserId, sseEmitter);
                 }
         );
         sseEmitter.onTimeout(() -> {
                     log.info("Sse {} timeout", currentUserId);
                     sseEmitter.complete();
                     emitters.remove(currentUserId, sseEmitter);
                 }
         );
         sseEmitter.onError((e) -> {
             log.error("Sse {} error", currentUserId, e);
             sseEmitter.completeWithError(e);
             emitters.remove(currentUserId, sseEmitter);
         });

         try {
             sseEmitter.send(SseEmitter.event()
                     .name("INIT")
                     .data("Connection established"));
         } catch (IOException e) {
             log.error("Error sending INIT event to user {}", currentUserId, e);
             emitters.remove(currentUserId);
         }

         return sseEmitter;
     }

    public void sendNotification(String recipientId, Object notificationData) {
        SseEmitter sseEmitter = emitters.get(recipientId);
        if(Objects.nonNull(sseEmitter)){
            try {
                log.info("Sending notification to {}", recipientId);
                sseEmitter.send(
                        SseEmitter.event()
                                .name("notification")
                                .data(notificationData)
                );
            } catch (Exception e) {
                log.error("Error sending SSE to user {}", recipientId, e);
                emitters.remove(recipientId, sseEmitter);
            }
        } else {
            log.warn("SSE Warning: User {} not found in emitters map. Notification skipped.", recipientId);
        }
    }

}