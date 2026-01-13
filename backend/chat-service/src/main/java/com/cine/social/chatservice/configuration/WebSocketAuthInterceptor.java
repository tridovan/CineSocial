package com.cine.social.chatservice.configuration;

import com.cine.social.chatservice.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ExecutorChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ExecutorChannelInterceptor {

    private final ChatRoomRepository chatRoomRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    
    @Override
    public Message<?> beforeHandle(Message<?> message, MessageChannel channel, MessageHandler handler) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) return message;

        Authentication user = (Authentication) accessor.getUser();

        if (StompCommand.SEND.equals(accessor.getCommand()) || StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            if (user == null) {
                throw new AccessDeniedException("User not authenticated");
            }

            SecurityContextHolder.getContext().setAuthentication(user);
            log.debug("SecurityContext set for thread: {} - User: {}", Thread.currentThread().getName(), user.getName());

            // Validate quyền truy cập Room cho cả SEND và SUBSCRIBE
            validateRoomAccess(user, accessor.getDestination());
        }

        return message;
    }

    @Override
    public void afterMessageHandled(Message<?> message, MessageChannel channel, MessageHandler handler, Exception ex) {
        SecurityContextHolder.clearContext();
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
        
        // Pattern cho Subscribe: /topic/room/{id} hoặc /user/queue/room/{id}
        String roomPattern = "**/room/{roomId}";
        if (pathMatcher.match(roomPattern, destination)) {
            return pathMatcher.extractUriTemplateVariables(roomPattern, destination).get("roomId");
        }

        // Pattern cho Send: /app/chat/{id}
        String chatPattern = "**/chat/{roomId}";
        if (pathMatcher.match(chatPattern, destination)) {
            return pathMatcher.extractUriTemplateVariables(chatPattern, destination).get("roomId");
        }
        
        return null;
    }
}