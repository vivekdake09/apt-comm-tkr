package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByExpiresAtAfter(LocalDateTime now);
    List<Poll> findAllByOrderByCreatedAtDesc();
}
