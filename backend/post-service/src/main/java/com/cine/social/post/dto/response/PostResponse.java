package com.cine.social.post.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private String id;
    private String title;
    private String content;
    private String resourceUrl;
    private String resourceType;
    private int commentCount;
    private int voteCount;
    private int userVoteValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse userProfile;
}