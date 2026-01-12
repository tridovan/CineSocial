package com.cine.social.chatservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String id;
    private String roomId;
    private String senderId;
    private String content;
    private String contentImgUrl;
    private Date timestamp;
    private String sendFirstName;
    private String sendLastName;
    private String senderAvatar;
    private List<String> recipientIds;
}
