package com.cine.social.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        String firstName,
        String lastName,
        String imgUrl,
        String backgroundImgUrl,
        String bio
) {}
