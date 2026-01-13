package com.cine.social.chatservice.mapper;

import com.cine.social.chatservice.dto.request.ChatMessageRequest;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.entity.ChatMessage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessage toEntity(ChatMessageRequest request);
    ChatMessageResponse toResponse(ChatMessage entity);
}
