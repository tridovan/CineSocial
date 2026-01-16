package com.cine.social.chatservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class ChatRoomRequest {
    private String chatName;
    private String imgUrl;
    @NotEmpty(message = "Room must have members")
    private List<String> memberIds;
}
