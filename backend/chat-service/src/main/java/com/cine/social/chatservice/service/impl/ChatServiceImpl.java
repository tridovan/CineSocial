package com.cine.social.chatservice.service.impl;

import com.cine.social.chatservice.constant.RoomType;
import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.cine.social.chatservice.entity.UserProfile;
import com.cine.social.chatservice.exception.ChatErrorCode;
import com.cine.social.chatservice.dto.request.ChatMessageRequest;
import com.cine.social.chatservice.entity.ChatMessage;
import com.cine.social.chatservice.entity.ChatRoom;
import com.cine.social.chatservice.mapper.ChatMessageMapper;
import com.cine.social.chatservice.repository.ChatMessageRepository;
import com.cine.social.chatservice.repository.ChatRoomRepository;
import com.cine.social.chatservice.repository.UserProfileRepository;
import com.cine.social.chatservice.service.ChatService;
import com.cine.social.chatservice.service.UserProfileService;
import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.utils.PageHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final UserProfileRepository userProfileRepository;
    private final UserProfileService userProfileService;
    private final static String CHAT_MESSAGE_TOPIC = "chat-messages-topic";

    @Override
    public void saveAndSend(String roomId, ChatMessageRequest request, String senderId) {
        userProfileService.ensureUserProfileExists(senderId);

        try {
            ChatRoom chatRoomResponse = chatRoomRepository.findById(roomId)
                    .orElseThrow(() -> new AppException(ChatErrorCode.INVALID_MESSAGE));

            ChatMessage savedMsg = saveMessageToDb(request, senderId, chatRoomResponse.getId());

            UserProfile senderProfile = userProfileRepository.findById(senderId).orElseGet(
                    () -> UserProfile.builder()
                                    .id(senderId)
                                    .firstName("Social")
                                    .lastName("Cine")
                                    .imageUrl("")
                                    .build()
            );
            ChatMessageResponse response = buildChatResponse(savedMsg, senderProfile, chatRoomResponse);

            sendToKafka(chatRoomResponse.getId(), response);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error saving or sending message for senderId: {}", senderId, e);
            throw new AppException(ChatErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }



    @Override
    public PageResponse<List<ChatMessageResponse>> getChatHistory(String roomId, int pageNo, int pageSize) {
        Pageable pageable = PageHelper.pageEngine(pageNo, pageSize, "timestamp:desc");
        Page<ChatMessage> page = chatMessageRepository.findByRoomId(roomId, pageable);

        Map<String, UserProfile> lookupMap = getUserProfileMap(page.getContent());
        List<ChatMessageResponse> items = mapMessagesToResponses(page.getContent(), lookupMap);

        return PageResponse.<List<ChatMessageResponse>>builder()
                .totalPage(page.getTotalPages())
                .totalElement(page.getTotalElements())
                .pageNo(pageNo)
                .pageSize(pageSize)
                .items(items)
                .build();
    }

    @Override
    public void sendPrivateMessage(String recipientId, ChatMessageRequest request, String senderId) {
        ChatRoom chatRoom = resolvePrivateChatRoom(recipientId, senderId);
        saveAndSend(chatRoom.getId(), request, senderId);
    }

    @Override
    public void sendGroupMessage(String roomId, ChatMessageRequest request, String senderId) {
        saveAndSend(roomId, request, senderId);

    }


    private ChatMessage saveMessageToDb(ChatMessageRequest request, String senderId, String roomId) {
        ChatMessage chatMessage = chatMessageMapper.toEntity(request);
        chatMessage.setSenderId(senderId);
        chatMessage.setRoomId(roomId);
        return chatMessageRepository.save(chatMessage);
    }


    private ChatMessageResponse buildChatResponse(ChatMessage message, UserProfile senderProfile, ChatRoom chatRoomResponse) {
        ChatMessageResponse response = chatMessageMapper.toResponse(message);
        enrichResponseWithProfile(response, senderProfile);

        List<String> recipientIds = chatRoomResponse.getMemberIds().stream()
                .filter(id -> !id.equals(message.getSenderId()))
                .toList();
        response.setRecipientIds(recipientIds);
        return response;
    }

    private void sendToKafka(String roomId, ChatMessageResponse response) throws Exception {
        String jsonMessage = objectMapper.writeValueAsString(response);
        kafkaTemplate.send(CHAT_MESSAGE_TOPIC, roomId, jsonMessage);
        log.debug("Message sent to topic {} with roomId {}", CHAT_MESSAGE_TOPIC, roomId);
    }

    private Map<String, UserProfile> getUserProfileMap(List<ChatMessage> messages) {
        List<String> senders = messages.stream().map(ChatMessage::getSenderId).distinct().toList();
        return userProfileRepository.findAllById(senders).stream()
                .collect(Collectors.toMap(UserProfile::getId, Function.identity(), (a, b) -> b));
    }

    private List<ChatMessageResponse> mapMessagesToResponses(List<ChatMessage> messages, Map<String, UserProfile> lookupMap) {
        return messages.stream().map(msg -> {
            ChatMessageResponse response = chatMessageMapper.toResponse(msg);
            enrichResponseWithProfile(response, lookupMap.get(msg.getSenderId()));
            return response;
        }).toList();
    }

    private void enrichResponseWithProfile(ChatMessageResponse response, UserProfile profile) {
        if(Objects.nonNull(profile)) {
            response.setSendFirstName(profile.getFirstName());
            response.setSendLastName(profile.getLastName());
            response.setSenderAvatar(profile.getImageUrl());
        }else {
            response.setSendFirstName("Cine");
            response.setSendLastName("Social");
            response.setSenderAvatar("");
        }
    }

    private ChatRoom resolvePrivateChatRoom(String senderId, String recipientId) {
        List<String> sortedIds = Arrays.asList(senderId, recipientId);
        Collections.sort(sortedIds);
        String uniqueRoomId = String.join("_", sortedIds);

        return chatRoomRepository.findById(uniqueRoomId)
                .orElseGet(() -> createPrivateRoom(uniqueRoomId, senderId, recipientId));
    }

    private ChatRoom createPrivateRoom(String id, String senderId, String recipientId) {
        ChatRoom newRoom = ChatRoom.builder()
                .id(id)
                .type(RoomType.PRIVATE)
                .memberIds(Arrays.asList(senderId, recipientId))
                .build();
        return chatRoomRepository.save(newRoom);
    }
}