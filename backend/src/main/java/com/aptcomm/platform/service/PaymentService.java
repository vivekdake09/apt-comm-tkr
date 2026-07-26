package com.aptcomm.platform.service;

import com.aptcomm.platform.model.Payment;
import com.aptcomm.platform.model.PaymentStatus;
import com.aptcomm.platform.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public Payment processPayment(Long paymentId, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Payment has already been processed");
        }

        // Mock payment gateway error handling simulation
        if ("FAIL_TXN".equalsIgnoreCase(transactionId)) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Mock Payment Gateway declined transaction: Insufficient funds.");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionId(transactionId);
        payment.setPaymentDate(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Transactional
    public void handleWebhook(String eventType, Long paymentId, String transactionId, String status) {
        // Payment gateway webhook integration - generated with mock webhook logic
        Payment payment = paymentRepository.findById(paymentId)
                .orElse(null);
        if (payment == null) return;

        if ("payment.captured".equals(eventType) && "SUCCESS".equalsIgnoreCase(status)) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);
        } else if ("payment.failed".equals(eventType)) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
    }
}
