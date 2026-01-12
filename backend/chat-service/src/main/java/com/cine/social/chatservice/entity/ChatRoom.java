package com.cine.social.chatservice.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "chat_rooms")
@Data
@Builder
public class ChatRoom {
    @Id
    private String id;
    private String chatName; // Null if 1-1
    private RoomType type;   // PRIVATE or GROUP
    private List<String> memberIds;
    
    public enum RoomType {
        PRIVATE, GROUP
    }
}