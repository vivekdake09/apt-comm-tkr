package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookingDto {

    public record BookingRequest(
        @NotBlank(message = "Facility name is required")
        String facilityName,

        @NotBlank(message = "Date is required (YYYY-MM-DD)")
        String bookingDate,

        @NotBlank(message = "Start time is required (HH:MM)")
        String startTime,

        @NotBlank(message = "End time is required (HH:MM)")
        String endTime
    ) {}
}
