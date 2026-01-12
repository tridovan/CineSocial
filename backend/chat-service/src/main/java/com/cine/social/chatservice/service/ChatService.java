package com.cine.social.chatservice.service;

import com.cine.social.chatservice.dto.request.ChatMessageRequest;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.entity.ChatRoom;
import com.cine.social.common.dto.response.PageResponse;

import java.util.List;

public interface ChatService {
    void saveAndSend(ChatMessageRequest request);
    List<ChatRoom> getUserRooms();
    PageResponse<List<ChatMessageResponse>> getChatHistory(String roomId, int pageNo, int pageSize);

}
