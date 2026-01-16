package com.cine.social.notificationservice.enitty;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "notifications")
@Data
@Builder
public class Notification {
    @Id
    private String id;
    @Indexed
    private String recipientId;
    private String actorId;
    private String actorName;
    private String actorImgUrl;
    private String type;
    private String message;
    private String resourceId;
    @Builder.Default
    private boolean seen = false;
    private Date createdAt;
}