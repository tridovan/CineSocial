package com.cine.social.chatservice.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String content;
    private String contentImgUrl;
}
