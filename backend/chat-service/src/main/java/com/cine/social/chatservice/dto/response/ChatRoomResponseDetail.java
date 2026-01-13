package com.cine.social.chatservice.dto.response;

import lombok.*;

import java.util.List;


@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChatRoomResponseDetail {
    private String id;
    private String chatName;
    private String type;
    private String imgUrl;
    private List<String> memberIds;
    private List<UserResponse> members;
}
