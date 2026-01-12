package com.cine.social.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdatedEvent {
    private String userId;
    private String firstName;
    private String lastName;
    private String imageUrl;
}