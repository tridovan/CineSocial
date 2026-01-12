package com.cine.social.chatservice.controller;

import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.entity.ChatRoom;
import com.cine.social.chatservice.service.ChatService;
import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.common.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoom>> getUserRooms() {
        return ApiResponse.success(chatService.getUserRooms());
    }

    @GetMapping("/history/{roomId}")
    public ApiResponse<PageResponse<List<ChatMessageResponse>>> getChatHistory(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size


    ) {
        return ApiResponse.success(chatService.getChatHistory(roomId, page, size));
    }
}