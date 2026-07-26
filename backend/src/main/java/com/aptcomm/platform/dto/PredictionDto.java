package com.aptcomm.platform.dto;

public class PredictionDto {
    public record PredictionResult(
        String category,
        String location,
        double recurrenceRiskScore,
        String statusDescription,
        String recommendations
    ) {}
}
