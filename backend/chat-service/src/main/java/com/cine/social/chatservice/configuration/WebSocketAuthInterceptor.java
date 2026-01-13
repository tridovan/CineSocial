package com.cine.social.chatservice.configuration;

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

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ExecutorChannelInterceptor {

    // Chuyển logic từ preSend sang beforeHandle để chạy trên cùng Thread với Controller
    @Override
    public Message<?> beforeHandle(Message<?> message, MessageChannel channel, MessageHandler handler) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) return message;

        Authentication user = (Authentication) accessor.getUser();

        // Nếu SEND hoặc SUBSCRIBE mà mất user -> Cút
        if (StompCommand.SEND.equals(accessor.getCommand()) || StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            if (user == null) {
                throw new AccessDeniedException("User not authenticated");
            }

            // Set context cho Controller/Service dùng
            SecurityContextHolder.getContext().setAuthentication(user);
            log.debug("SecurityContext set for thread: {} - User: {}", Thread.currentThread().getName(), user.getName());

            // TODO: Authorization Logic
            // Ví dụ: user "A" có được subscribe vào topic "/group/xyz" không?
            // if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            //      checkPermission(user, accessor.getDestination());
            // }
        }

        return message;
    }

    @Override
    public void afterMessageHandled(Message<?> message, MessageChannel channel, MessageHandler handler, Exception ex) {
        // Dọn dẹp context sau khi Controller xử lý xong
        SecurityContextHolder.clearContext();
    }
}