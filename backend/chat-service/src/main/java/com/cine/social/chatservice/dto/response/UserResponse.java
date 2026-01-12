package com.cine.social.chatservice.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserResponse {
    String id;
    String email;
    String firstName;
    String lastName;
    String imgUrl;
}
