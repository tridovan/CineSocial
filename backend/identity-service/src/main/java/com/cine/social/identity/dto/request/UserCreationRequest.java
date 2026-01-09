package com.cine.social.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record UserCreationRequest(
    @Size(min = 10, message = "Invalid email")
    String email,
    @Size(min = 6, message = "Password must be at least 6 chars")
    String password,
    @NotBlank(message = "First name must be filled")
    String firstName,
    @NotBlank(message = "Last name must be filled")
    String lastName
) {}
