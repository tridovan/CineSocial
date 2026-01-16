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
import com.cine.social.chatservice.repository.ChatMessageRepository;
import com.cine.social.chatservice.repository.ChatRoomRepository;
import com.cine.social.chatservice.repository.UserProfileRepository;
import com.cine.social.chatservice.service.ChatRoomService;
import com.cine.social.chatservice.service.UserProfileService;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.function.Consumer;
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
    private final ChatMessageRepository chatMessageRepository;


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
        String currentUserId = SecurityUtils.getCurrentUserId();
        List<ChatRoom> rooms = chatRoomRepository.findByMemberIdsContaining(currentUserId);
        Set<String> profileIds = rooms.stream()
                .flatMap(room -> room.getMemberIds().stream())
                .collect(Collectors.toSet());
        List<UserProfile> profiles = userProfileRepository.findAllById(profileIds);
        Map<String, UserProfile> lookupMapProfile = profiles.stream()
                .collect(Collectors.toMap(UserProfile::getId, Function.identity(), (p1, p2) -> p1));

        Map<String, String> roomNames = rooms.stream().filter(chatRoom -> Strings.isBlank(chatRoom.getChatName()))
                .collect(Collectors.toMap(
                        ChatRoom::getId,
                        chatRoom -> {
                            List<String> ids = chatRoom.getMemberIds().stream().filter(id -> !id.equals(currentUserId)).limit(4).toList();
                            List<String> names = ids.stream().filter(id -> Objects.nonNull(lookupMapProfile.get(id)))
                                    .map(id -> lookupMapProfile.get(id).getFirstName() + " " + lookupMapProfile.get(id).getLastName()).toList();
                            return String.join(",", names);
                        }
                ));


        var response = chatRoomMapper.toListResponses(rooms);
        response.stream().forEach(rsp -> {
            if(Strings.isBlank(rsp.getChatName())){
                rsp.setChatName(roomNames.get(rsp.getId()));
            }
        });

        return response;
    }



    @Override
    public ChatRoomResponseDetail getUserRoomDetail(String roomId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        ChatRoom chatRoom = findChatRoomByIdOrThrowException(roomId);
        List<UserProfile> userProfiles = userProfileRepository.findAllById(chatRoom.getMemberIds());
        boolean isMember = chatRoom.getMemberIds().stream()
                .anyMatch(id -> id.equals(currentUserId));
        if(!isMember){
            throw new AppException(ChatErrorCode.UNAUTHORIZED);
        }

        Map<String, String> userProfileNames = userProfiles.stream()
                .collect(Collectors.toMap(UserProfile::getId,
        usp -> usp.getFirstName() + " " + usp.getLastName()
                ,(p1, p2) -> p2));
        String chatName = "Cine Social";
        if(Strings.isBlank(chatRoom.getChatName())){
            List<String> ids = chatRoom.getMemberIds().stream().filter(id -> !id.equals(currentUserId)).limit(4).toList();
            List<String> names = ids.stream().filter(id -> Objects.nonNull(userProfileNames.get(id))).map(userProfileNames::get).toList();
            chatName = String.join(",", names);
        }
        return ChatRoomResponseDetail.builder()
                    .id(chatRoom.getId())
                    .type(chatRoom.getType().name())
                    .chatName(chatName)
                    .imgUrl(chatRoom.getImgUrl())
                    .memberIds(chatRoom.getMemberIds())
                    .members(userProfileMapper.toListResponses(userProfiles))
                    .build();
    }

    @Override
    @Transactional
    public void leaveChatRoom(String id) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        ChatRoom chatRoom = chatRoomRepository.findById(id)
                .orElseThrow( () -> new AppException(ChatErrorCode.CHAT_ROOM_NOT_FOUND));
        if(chatRoom.getType().equals(RoomType.PRIVATE)){
            throw new AppException(ChatErrorCode.INVALID_ACTION);
        }
        if(!chatRoom.getMemberIds().contains(currentUserId)){
            throw new AppException(ChatErrorCode.UNAUTHORIZED);
        }
        chatRoom.getMemberIds().remove(currentUserId);
        chatRoomRepository.save(chatRoom);
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

}
