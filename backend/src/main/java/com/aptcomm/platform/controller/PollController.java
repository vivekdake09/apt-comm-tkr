package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.PollDto.*;
import com.aptcomm.platform.model.*;
import com.aptcomm.platform.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/polls")
public class PollController {

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private PollVoteRepository pollVoteRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<PollResponse>> listPolls() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        List<Poll> polls = pollRepository.findAllByOrderByCreatedAtDesc();
        List<PollResponse> responses = new ArrayList<>();

        for (Poll poll : polls) {
            List<OptionResponse> optionResponses = new ArrayList<>();
            boolean hasVoted = false;
            Long votedOptionId = null;

            Optional<PollVote> userVote = pollVoteRepository.findByResidentIdAndPollId(userId, poll.getId());
            if (userVote.isPresent()) {
                hasVoted = true;
                votedOptionId = userVote.get().getOption().getId();
            }

            for (PollOption option : poll.getOptions()) {
                long count = pollVoteRepository.countByOptionId(option.getId());
                optionResponses.add(new OptionResponse(option.getId(), option.getOptionText(), count));
            }

            responses.add(new PollResponse(
                    poll.getId(),
                    poll.getQuestion(),
                    poll.getCreatedBy() != null ? poll.getCreatedBy().getFullName() : "System",
                    poll.getExpiresAt().toString(),
                    poll.getCreatedAt() != null ? poll.getCreatedAt().toString() : LocalDateTime.now().toString(),
                    hasVoted,
                    votedOptionId,
                    optionResponses
            ));
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPoll(@Valid @RequestBody PollRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime expiry = LocalDateTime.parse(request.expiresAt());

        Poll poll = Poll.builder()
                .question(request.question())
                .createdBy(admin)
                .expiresAt(expiry)
                .build();

        List<PollOption> options = new ArrayList<>();
        for (String optText : request.options()) {
            options.add(PollOption.builder()
                    .poll(poll)
                    .optionText(optText)
                    .build());
        }
        poll.setOptions(options);

        Poll saved = pollRepository.save(poll);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/vote")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<?> vote(@PathVariable Long id, @Valid @RequestBody VoteRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User resident = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found"));

        if (poll.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("This poll has expired");
        }

        if (pollVoteRepository.findByResidentIdAndPollId(userId, id).isPresent()) {
            return ResponseEntity.badRequest().body("You have already voted on this poll");
        }

        PollOption option = pollOptionRepository.findById(request.optionId())
                .orElseThrow(() -> new IllegalArgumentException("Selected option not found"));

        if (!option.getPoll().getId().equals(id)) {
            return ResponseEntity.badRequest().body("Selected option does not belong to this poll");
        }

        PollVote vote = PollVote.builder()
                .poll(poll)
                .option(option)
                .resident(resident)
                .build();

        pollVoteRepository.save(vote);
        return ResponseEntity.ok("Vote registered successfully");
    }
}
