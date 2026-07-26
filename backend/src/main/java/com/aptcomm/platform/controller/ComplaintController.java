package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.ComplaintDto.*;
import com.aptcomm.platform.dto.PredictionDto.PredictionResult;
import com.aptcomm.platform.model.*;
import com.aptcomm.platform.repository.ComplaintRepository;
import com.aptcomm.platform.repository.UserRepository;
import com.aptcomm.platform.service.ComplaintAnalyticsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintAnalyticsService complaintAnalyticsService;

    @GetMapping
    public ResponseEntity<List<Complaint>> listComplaints() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(complaintRepository.findAllByOrderByCreatedAtDesc());
        } else {
            return ResponseEntity.ok(complaintRepository.findByResidentIdOrderByCreatedAtDesc(userId));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<?> raiseComplaint(@Valid @RequestBody ComplaintRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User resident = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Resident user not found"));

        ComplaintCategory category;
        try {
            category = ComplaintCategory.valueOf(request.category().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid category. Must be PLUMBING, ELECTRICAL, SECURITY, CLEANLINESS, PARKING, or OTHERS");
        }

        Complaint complaint = Complaint.builder()
                .resident(resident)
                .title(request.title())
                .description(request.description())
                .category(category)
                .status(ComplaintStatus.PENDING)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @Valid @RequestBody ComplaintStatusRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint record not found"));

        ComplaintStatus status;
        try {
            status = ComplaintStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status. Must be PENDING, IN_PROGRESS, or RESOLVED");
        }

        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/predictions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PredictionResult>> getPredictions() {
        return ResponseEntity.ok(complaintAnalyticsService.predictRecurringComplaints());
    }
}
