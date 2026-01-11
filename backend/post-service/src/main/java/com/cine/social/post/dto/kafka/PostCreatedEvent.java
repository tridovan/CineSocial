package com.cine.social.post.dto.kafka;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCreatedEvent {
    String postId;
    String resourceUrl;
}