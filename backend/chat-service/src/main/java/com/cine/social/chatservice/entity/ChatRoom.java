package com.cine.social.chatservice.entity;

import com.cine.social.chatservice.constant.RoomType;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "chat_rooms")
@Data
@Builder
public class ChatRoom {
    @Id
    private String id;
    private String chatName;
    private RoomType type;
    private String imgUrl;
    @Indexed(unique = true)
    private String membersHash;
    private List<String> memberIds;

}