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
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String resourceUrl;
    @Pattern(regexp = "^(IMAGE|VIDEO|NONE)$", message = "Invalid resource type. Must be IMAGE, VIDEO or NONE")
    private String resourceType;
}
