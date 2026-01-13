package com.cine.social.chatservice.service;

import com.cine.social.chatservice.dto.request.ChatMessageRequest;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.common.dto.response.PageResponse;

import java.util.List;

public interface ChatService {
    void saveAndSend(String roomId, ChatMessageRequest request, String senderId);
    PageResponse<List<ChatMessageResponse>> getChatHistory(String roomId, int pageNo, int pageSize);

    void sendPrivateMessage(String recipientId, ChatMessageRequest request, String senderId);

    void sendGroupMessage(String roomId, ChatMessageRequest request, String senderId);
}
