package com.cine.social.event;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostOutboxEvent {
    private String id;
    private String title;
    private String content;
    private String resourceUrl;
    private String resourceType;
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private int voteCount;
    private int commentCount;
    private String createdAt;
}
