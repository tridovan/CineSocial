package com.cine.social.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaProcessedEvent {
    private String postId;
    private String status;
    private String processedUrl;
}