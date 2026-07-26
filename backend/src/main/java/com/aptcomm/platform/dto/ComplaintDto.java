package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComplaintDto {

    public record ComplaintRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 100)
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Category is required")
        String category // PLUMBING, ELECTRICAL, etc.
    ) {}

    public record ComplaintStatusRequest(
        @NotBlank(message = "Status is required")
        String status // PENDING, IN_PROGRESS, RESOLVED
    ) {}
}
