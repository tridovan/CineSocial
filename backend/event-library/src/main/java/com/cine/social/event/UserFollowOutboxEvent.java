package com.cine.social.event;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFollowOutboxEvent {
    private String followerId;
    private String followedId;
    private String action;
}
