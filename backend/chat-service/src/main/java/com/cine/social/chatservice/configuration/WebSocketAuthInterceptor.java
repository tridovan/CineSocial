package com.cine.social.chatservice.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String SESSION_JWT_KEY = "JWT_TOKEN";

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        // 1. Xử lý khi Client CONNECT lần đầu
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            handleConnect(accessor);
        }

        // 2. Context Propagation: Lấy token từ session attribute (đã lưu lúc connect)
        // và set vào ThreadLocal để FeignClient có thể sử dụng ở các lớp Service/Controller phía sau.
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey(SESSION_JWT_KEY)) {
            String token = (String) sessionAttributes.get(SESSION_JWT_KEY);
            WebSocketAuthContext.setToken(token);
        }

        return message;
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        // 3. Dọn dẹp ThreadLocal sau khi xử lý xong message để tránh memory leak
        WebSocketAuthContext.clear();
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        List<String> authorization = accessor.getNativeHeader(AUTHORIZATION_HEADER);

        if (authorization != null && !authorization.isEmpty()) {
            String authHeader = authorization.get(0);
            if (authHeader.startsWith(BEARER_PREFIX)) {
                String token = authHeader.substring(BEARER_PREFIX.length());
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    JwtAuthenticationToken authentication = new JwtAuthenticationToken(jwt);
                    accessor.setUser(authentication);

                    // Lưu raw token vào session để dùng lại cho các request sau (SEND, SUBSCRIBE...)
                    if (accessor.getSessionAttributes() != null) {
                        accessor.getSessionAttributes().put(SESSION_JWT_KEY, token);
                    }
                    log.info("User {} connected via WebSocket", jwt.getSubject());
                } catch (Exception e) {
                    log.error("Invalid Token in WebSocket: {}", e.getMessage());
                }
            }
        }
    }
}