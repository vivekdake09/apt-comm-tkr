package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ParcelDto {

    public record ParcelRequest(
        @NotNull(message = "Resident ID is required")
        Long residentId,

        @NotBlank(message = "Carrier name is required")
        String carrier,

        String trackingNumber
    ) {}
}
