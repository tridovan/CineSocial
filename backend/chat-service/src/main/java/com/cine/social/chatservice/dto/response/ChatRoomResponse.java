package com.cine.social.chatservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChatRoomResponse {
    private String id;
    private String chatName;
    private String type;
    private String imgUrl;
}
