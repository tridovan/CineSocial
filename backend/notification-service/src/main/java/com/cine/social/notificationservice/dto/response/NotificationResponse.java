package com.cine.social.notificationservice.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.Date;

@Data
@NoArgsConstructor
public class NotificationResponse {
    private String id;
    private String recipientId;
    private String actorId;
    private String actorName;
    private String actorImgUrl;
    private String type;
    private String message;
    private String resourceId;
    private boolean isRead;
    private Date createdAt;
}
