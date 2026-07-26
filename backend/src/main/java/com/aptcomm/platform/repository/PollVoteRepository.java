package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    Optional<PollVote> findByResidentIdAndPollId(Long residentId, Long pollId);
    List<PollVote> findByPollId(Long pollId);
    long countByOptionId(Long optionId);
}
