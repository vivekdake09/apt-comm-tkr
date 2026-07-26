package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentDto {

    public record PaymentProcessRequest(
        @NotBlank(message = "Transaction ID is required")
        String transactionId
    ) {}
}
