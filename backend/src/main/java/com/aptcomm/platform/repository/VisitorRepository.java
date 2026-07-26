package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.Visitor;
import com.aptcomm.platform.model.VisitorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Optional<Visitor> findByQrCodeToken(String qrCodeToken);
    List<Visitor> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    List<Visitor> findByStatusInOrderByCreatedAtDesc(List<VisitorStatus> statuses);
    List<Visitor> findAllByOrderByCreatedAtDesc();
}
