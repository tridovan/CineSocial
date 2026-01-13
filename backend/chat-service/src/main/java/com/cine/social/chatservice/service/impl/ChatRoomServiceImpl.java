package com.cine.social.chatservice.service.impl;

import com.cine.social.chatservice.constant.RoomType;
import com.cine.social.chatservice.dto.request.ChatRoomRequest;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.dto.response.ChatRoomResponse;
import com.cine.social.chatservice.dto.response.ChatRoomResponseDetail;
import com.cine.social.chatservice.dto.response.UserResponse;
import com.cine.social.chatservice.entity.ChatMessage;
import com.cine.social.chatservice.entity.ChatRoom;
import com.cine.social.chatservice.entity.UserProfile;
import com.cine.social.chatservice.exception.ChatErrorCode;
import com.cine.social.chatservice.mapper.ChatRoomMapper;
import com.cine.social.chatservice.mapper.UserProfileMapper;
import com.cine.social.chatservice.repository.ChatRoomRepository;
import com.cine.social.chatservice.repository.UserProfileRepository;
import com.cine.social.chatservice.service.ChatRoomService;
import com.cine.social.chatservice.service.UserProfileService;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomServiceImpl implements ChatRoomService {
    private final ChatRoomMapper chatRoomMapper;
    private final UserProfileMapper userProfileMapper;
    private final ChatRoomRepository chatRoomRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserProfileService userProfileService;


    @Override
    public ChatRoomResponse createRoom(ChatRoomRequest request) {
        String creatorId = SecurityUtils.getCurrentUserId();
        List<String> members = new ArrayList<>(request.getMemberIds());
        if (!members.contains(creatorId)) {
            members.add(creatorId);
        }

        userProfileService.ensureUserProfilesExists(request.getMemberIds());

        String id = UUID.randomUUID().toString();
        ChatRoom chatRoomResponse = ChatRoom.builder()
                .id(id)
                .chatName(request.getChatName())
                .type(RoomType.GROUP)
                .memberIds(members)
                .build();
        ChatRoom savedEntity = chatRoomRepository.save(chatRoomResponse);
        return chatRoomMapper.toResponse(savedEntity);
    }

    @Override
    public List<ChatRoomResponse> getUserRooms() {
        String userId = SecurityUtils.getCurrentUserId();
        var rooms = chatRoomRepository.findByMemberIdsContaining(userId);
        return chatRoomMapper.toListResponses(rooms);
    }

    @Override
    public ChatRoomResponseDetail getUserRoomDetail(String roomId) {
        ChatRoom chatRoom = findChatRoomByIdOrThrowException(roomId);
        List<UserProfile> userProfiles = userProfileRepository.findAllById(chatRoom.getMemberIds());
        return ChatRoomResponseDetail.builder()
                    .id(chatRoom.getId())
                    .chatName(chatRoom.getChatName())
                    .imgUrl(chatRoom.getImgUrl())
                    .memberIds(chatRoom.getMemberIds())
                    .members(userProfileMapper.toListResponses(userProfiles))
                    .build();
    }

    @Override
    public ChatRoomResponse updateRoom(ChatRoomRequest request, String id) {
        ChatRoom chatRoom = findChatRoomByIdOrThrowException(id);
        if (Strings.isNotBlank(request.getChatName())) {
            chatRoom.setChatName(request.getChatName());
        }

        if (Strings.isNotBlank(request.getImgUrl())) {
            chatRoom.setImgUrl(request.getImgUrl());
        }

        List<String> newMemberIds = new ArrayList<>(request.getMemberIds());
        chatRoom.setMemberIds(newMemberIds);

        ChatRoom saved = chatRoomRepository.save(chatRoom);
        return chatRoomMapper.toResponse(saved);
    }

    private ChatRoom findChatRoomByIdOrThrowException(String id){
        return chatRoomRepository.findById(id).orElseThrow(
                () -> new AppException(ChatErrorCode.CHAT_ROOM_NOT_FOUND)
        );
    }

    private Map<String, UserProfile> getUserProfileMap(List<String> memberIds) {
        return userProfileRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(UserProfile::getId, Function.identity(), (a, b) -> b));
    }
}
