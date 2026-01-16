package com.cine.social.chatservice.configuration;

import com.cine.social.chatservice.repository.ChatRoomRepository;
import com.cine.social.chatservice.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.ExecutorChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final ChatRoomRepository chatRoomRepository;
    private final UserProfileRepository userProfileRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (Objects.isNull(accessor) || Objects.isNull(accessor.getCommand())) return message;

        log.info("Command {} for user {}", accessor.getCommand(), accessor.getUser().getName());
        Authentication user = (Authentication) accessor.getUser();

        if (StompCommand.SEND.equals(accessor.getCommand()) || StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            if (user == null) {
                throw new AccessDeniedException("User not authenticated");
            }

            String destination = accessor.getDestination();

            String recipientId = extractRecipientId(destination);
            String roomId = extractRoomId(destination);

            if (recipientId != null) {
                validatePrivateAccess(user, destination);
            } else if (roomId != null) {
                validateRoomAccess(user, destination);
            }
        }
        return message;
    }


    private void validateRoomAccess(Authentication user, String destination) {
        String roomId = extractRoomId(destination);

        if (roomId != null) {
            boolean isMember = chatRoomRepository.findById(roomId)
                    .map(room -> room.getMemberIds().contains(user.getName()))
                    .orElse(false);

            if (!isMember) {
                log.warn("Access Denied: User {} tried to access room {} without membership", user.getName(), roomId);
                throw new AccessDeniedException("You are not a member of this chat room");
            }
        }

    }

    private String extractRoomId(String destination) {
        if (destination == null) return null;
        
        // Pattern cho Subscribe: /topic/room/{id}
        String subscribePattern = "**/topic/room/{roomId}";
        if (pathMatcher.match(subscribePattern, destination)) {
            return pathMatcher.extractUriTemplateVariables(subscribePattern, destination).get("roomId");
        }

        // Pattern cho Send Group Message: /app/chat/room/{id}
        String groupChatPattern = "**/chat/room/{roomId}";
        if (pathMatcher.match(groupChatPattern, destination)) {
            return pathMatcher.extractUriTemplateVariables(groupChatPattern, destination).get("roomId");
        }
        
        return null;
    }


    private void validatePrivateAccess(Authentication user, String destination) {
        String recipientId = extractRecipientId(destination);

        if (recipientId == null) return;

        if (recipientId.trim().isEmpty()) {
            throw new AccessDeniedException("Recipient ID cannot be empty");
        }

        boolean recipientExists = userProfileRepository.existsById(recipientId);

        if (!recipientExists) {
            log.warn("User {} tried to send message to non-existent user {}", user.getName(), recipientId);
            throw new AccessDeniedException("Recipient user does not exist");
        }

        if (user.getName().equals(recipientId)) {
            throw new AccessDeniedException("Cannot send private message to yourself");
        }
    }

    private String extractRecipientId(String destination) {
        if (destination == null) return null;

        // Client gửi lên: /app/chat/private/user123
        String privatePattern = "**/chat/private/{recipientId}";

        if (pathMatcher.match(privatePattern, destination)) {
            return pathMatcher.extractUriTemplateVariables(privatePattern, destination).get("recipientId");
        }
        return null;
    }

}