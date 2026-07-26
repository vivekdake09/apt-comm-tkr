package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VisitorDto {

    public record VisitorRequest(
        @NotBlank(message = "Visitor name is required")
        String name,

        @NotBlank(message = "Visitor phone is required")
        String phone,

        String purpose,
        
        String vehicleNumber
    ) {}
}
