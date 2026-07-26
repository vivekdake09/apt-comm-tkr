package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.Payment;
import com.aptcomm.platform.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByResidentIdOrderByDueDateDesc(Long residentId);
    List<Payment> findByResidentIdAndStatusOrderByDueDateDesc(Long residentId, PaymentStatus status);
    List<Payment> findAllByOrderByDueDateDesc();
}
