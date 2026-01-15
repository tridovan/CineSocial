package com.cine.social.identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserWallProfileResponse {
    String id;
    String email;
    String firstName;
    String lastName;
    String imgUrl;
    boolean isFollowed;
}
