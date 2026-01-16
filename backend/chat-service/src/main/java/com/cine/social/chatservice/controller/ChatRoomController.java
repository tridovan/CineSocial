package com.cine.social.chatservice.controller;

import com.cine.social.chatservice.dto.request.ChatRoomRequest;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.dto.response.ChatRoomResponse;
import com.cine.social.chatservice.dto.response.ChatRoomResponseDetail;
import com.cine.social.chatservice.service.ChatRoomService;
import com.cine.social.chatservice.service.ChatService;
import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.common.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatService chatService;

    @PostMapping
    public ApiResponse<ChatRoomResponse> createChatRoom(@RequestBody ChatRoomRequest request) {
        return ApiResponse.success(chatRoomService.createRoom(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ChatRoomResponse> updateChatRoom(@RequestBody ChatRoomRequest request, @PathVariable String id) {
        return ApiResponse.success(chatRoomService.updateRoom(request, id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteChatRom(@PathVariable String id) {
        chatRoomService.deleteRoom(id);
        return ApiResponse.success("Delete successfully");
    }

    @GetMapping
    public ApiResponse<List<ChatRoomResponse>> getUserChatRooms() {
        return ApiResponse.success(chatRoomService.getUserRooms());
    }

    @GetMapping("/{id}")
    public ApiResponse<ChatRoomResponseDetail> getChatRoomDetail(@PathVariable String id) {
        return ApiResponse.success(chatRoomService.getUserRoomDetail(id));
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
