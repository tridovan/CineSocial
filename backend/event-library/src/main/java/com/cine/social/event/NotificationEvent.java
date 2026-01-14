package com.cine.social.event;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {
    private String actorId;
    private String actorName;
    private String actorImgUrl;
    private String recipientId;
    private String resourceId;
    private String type;
    private String message;
    private String timestamp;
}
