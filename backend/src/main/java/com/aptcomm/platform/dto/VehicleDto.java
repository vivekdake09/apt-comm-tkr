package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class VehicleDto {

    public record VehicleLogRequest(
        @NotBlank(message = "Vehicle number is required")
        String vehicleNumber,

        String driverName,
        
        Long visitorId
    ) {}
}
