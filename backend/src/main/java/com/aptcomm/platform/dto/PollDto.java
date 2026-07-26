package com.aptcomm.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PollDto {

    public record PollRequest(
        @NotBlank(message = "Question is required")
        String question,

        @NotEmpty(message = "Options cannot be empty")
        List<String> options,

        @NotBlank(message = "Expiry date is required")
        String expiresAt
    ) {}

    public record VoteRequest(
        @NotNull(message = "Option selection is required")
        Long optionId
    ) {}

    public record PollResponse(
        Long id,
        String question,
        String createdBy,
        String expiresAt,
        String createdAt,
        boolean hasVoted,
        Long votedOptionId,
        List<OptionResponse> options
    ) {}

    public record OptionResponse(
        Long id,
        String optionText,
        long voteCount
    ) {}
}
