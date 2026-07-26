package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.PaymentDto.PaymentProcessRequest;
import com.aptcomm.platform.model.*;
import com.aptcomm.platform.repository.PaymentRepository;
import com.aptcomm.platform.repository.UserRepository;
import com.aptcomm.platform.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> listPayments() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.RESIDENT) {
            return ResponseEntity.ok(paymentRepository.findByResidentIdOrderByDueDateDesc(userId));
        } else {
            return ResponseEntity.ok(paymentRepository.findAllByOrderByDueDateDesc());
        }
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<?> payBill(@PathVariable Long id, @Valid @RequestBody PaymentProcessRequest request) {
        try {
            Payment updated = paymentService.processPayment(id, request.transactionId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> receiveWebhook(@RequestBody Map<String, Object> payload) {
        try {
            String eventType = (String) payload.get("event");
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            Long paymentId = Long.valueOf(data.get("paymentId").toString());
            String transactionId = (String) data.get("transactionId");
            String status = (String) data.get("status");

            paymentService.handleWebhook(eventType, paymentId, transactionId, status);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to parse webhook: " + e.getMessage());
        }
    }
}
