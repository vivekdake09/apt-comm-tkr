package com.aptcomm.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record LoginRequest(
        @NotBlank(message = "Username cannot be empty")
        String username,
        
        @NotBlank(message = "Password cannot be empty")
        String password
    ) {}

    public record RegisterRequest(
        @NotBlank(message = "Username cannot be empty")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
        String password,

        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Please provide a valid email address")
        String email,

        @NotBlank(message = "Full name cannot be empty")
        String fullName,

        String phone,

        @NotBlank(message = "Role is required")
        String role, // ADMIN, RESIDENT, SECURITY

        String flatNumber
    ) {}

    public record AuthResponse(
        String token,
        String username,
        String role,
        Long userId,
        String email,
        String fullName,
        String flatNumber
    ) {}
}
