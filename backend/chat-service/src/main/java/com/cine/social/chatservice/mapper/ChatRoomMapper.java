package com.cine.social.chatservice.mapper;

import com.cine.social.chatservice.dto.request.ChatRoomRequest;
import com.cine.social.chatservice.dto.response.ChatRoomResponse;
import com.cine.social.chatservice.entity.ChatRoom;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ChatRoomMapper {
    @Mapping(target = "type", expression = "java(entity.getType().name())")
    public abstract ChatRoomResponse toResponse(ChatRoom entity);
    public abstract List<ChatRoomResponse> toListResponses(List<ChatRoom> entity);
}
