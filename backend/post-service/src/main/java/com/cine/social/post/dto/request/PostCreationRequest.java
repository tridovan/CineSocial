package com.cine.social.post.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostCreationRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Content is required")
    private String content;
    private String resourceUrl;
    @Pattern(regexp = "^(IMAGE|VIDEO|NONE)$", message = "Invalid resource type. Must be IMAGE, VIDEO or NONE")
    @NotBlank(message = "Resource type is required")
    private String resourceType;
}
