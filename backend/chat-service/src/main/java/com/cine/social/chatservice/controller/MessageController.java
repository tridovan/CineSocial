package com.cine.social.chatservice.controller;

import com.cine.social.chatservice.dto.request.ChatMessageRequest;
import com.cine.social.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class MessageController {
    private final ChatService chatService;

    @MessageMapping("/chat/group/{roomId}")
    public void processGroupMessage(@DestinationVariable String roomId, @Payload ChatMessageRequest request, Principal principal) {
        chatService.sendGroupMessage(roomId, request, principal.getName());
    }

    @MessageMapping("/chat/private/{recipientId}")
    public void processPrivateMessage(@DestinationVariable String recipientId, @Payload ChatMessageRequest request, Principal principal) {
        chatService.sendPrivateMessage(recipientId, request, principal.getName());
    }
}
