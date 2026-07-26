package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class StaffDto {

    public record StaffRequest(
        @NotBlank(message = "Staff name is required")
        String name,

        @NotBlank(message = "Role is required")
        String role, // MAINTENANCE, CLEANING, etc.

        @NotBlank(message = "Phone number is required")
        String phone,

        @NotBlank(message = "Status is required")
        String status // ACTIVE, INACTIVE
    ) {}
}
