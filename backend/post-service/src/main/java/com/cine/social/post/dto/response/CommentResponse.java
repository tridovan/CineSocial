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
public class CommentResponse {
    private String id;
    private String content;
    private String imgUrl;
    private String parenCommentId;
    private int replyCount;
    private int voteCount;
    private int userVoteValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse authorProfile;
    private UserResponse replyToUserProfile;
}