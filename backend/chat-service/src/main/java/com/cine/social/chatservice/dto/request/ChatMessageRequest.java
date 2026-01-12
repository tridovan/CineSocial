package com.cine.social.chatservice.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {
    // Case 1: Chat tiếp hoặc Chat Group -> Bắt buộc có roomId
    private String roomId;
    
    // Case 2: Chat 1-1 lần đầu -> Bắt buộc có recipientId
    private String recipientId;
    
    private String content;
    private String contentImgUrl;
}