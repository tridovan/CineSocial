package com.cine.social.chatservice.controller;

import com.cine.social.chatservice.dto.request.ChatMessageRequest;
import com.cine.social.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class MessageController {
    private final ChatService chatService;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageRequest request, Principal principal) {
        System.out.println(principal.getName());
        chatService.saveAndSend(request, principal.getName());
    }
}
