package com.cine.social.chatservice.service;

import com.cine.social.chatservice.dto.request.ChatRoomRequest;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.dto.response.ChatRoomResponse;
import com.cine.social.chatservice.dto.response.ChatRoomResponseDetail;
import com.cine.social.common.dto.response.PageResponse;

import java.util.List;

public interface ChatRoomService {
    ChatRoomResponse createRoom(ChatRoomRequest request);
    ChatRoomResponse updateRoom(ChatRoomRequest request, String id);

    List<ChatRoomResponse> getUserRooms();

    ChatRoomResponseDetail getUserRoomDetail(String roomId);

}

