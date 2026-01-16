package com.cine.social.chatservice.entity;


import lombok.Builder;
import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "chat_messages")
@Data
@Builder
public class ChatMessage {
    @Id
    private String id;

    @Indexed
    private String roomId;

    private String senderId;
    private String content;
    private String contentImgUrl;
    @CreatedDate
    private Date timestamp;
}
