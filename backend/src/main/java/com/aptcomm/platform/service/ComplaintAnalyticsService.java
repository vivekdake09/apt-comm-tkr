package com.aptcomm.platform.service;

import com.aptcomm.platform.dto.PredictionDto.PredictionResult;
import com.aptcomm.platform.model.Complaint;
import com.aptcomm.platform.model.ComplaintCategory;
import com.aptcomm.platform.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintAnalyticsService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public List<PredictionResult> predictRecurringComplaints() {
        // ML complaint prediction — generated with statistical analytics model
        List<Complaint> complaints = complaintRepository.findAll();
        List<PredictionResult> results = new ArrayList<>();

        // Group complaints by (Category, Block)
        Map<String, List<Complaint>> grouped = complaints.stream()
                .filter(c -> c.getResident() != null && c.getResident().getFlatNumber() != null)
                .collect(Collectors.groupingBy(c -> {
                    String flat = c.getResident().getFlatNumber();
                    String block = extractBlock(flat);
                    return c.getCategory().name() + ":::" + block;
                }));

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        for (Map.Entry<String, List<Complaint>> entry : grouped.entrySet()) {
            String[] parts = entry.getKey().split(":::");
            String category = parts[0];
            String block = parts[1];
            List<Complaint> groupComplaints = entry.getValue();

            // Count complaints in the last 30 days
            long recentCount = groupComplaints.stream()
                    .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(thirtyDaysAgo))
                    .count();

            long totalCount = groupComplaints.size();

            if (totalCount >= 2) {
                // Calculate risk score based on density and recency
                double riskScore = (recentCount * 30.0) + ((totalCount - recentCount) * 10.0);
                riskScore = Math.min(99.0, Math.max(15.0, riskScore));

                String description;
                String recommendation;

                switch (ComplaintCategory.valueOf(category)) {
                    case PLUMBING:
                        description = String.format("High recurrence alert for PLUMBING issues in %s. %d incidents total (%d recently).", block, totalCount, recentCount);
                        recommendation = String.format("Schedule urgent plumbing inspection and mainline pressure valve checks for %s.", block);
                        break;
                    case ELECTRICAL:
                        description = String.format("Recurrence risk for ELECTRICAL issues in %s. %d incidents total.", block, totalCount);
                        recommendation = String.format("Conduct preventive thermal scan of sub-distribution boards and MCBs in %s.", block);
                        break;
                    case CLEANLINESS:
                        description = String.format("CLEANLINESS complaints are rising in %s.", block);
                        recommendation = String.format("Re-assign cleaning staff rosters and perform deep disinfection in common hallways of %s.", block);
                        break;
                    case SECURITY:
                        description = String.format("SECURITY vulnerability pattern observed in %s.", block);
                        recommendation = String.format("Deploy secondary patrolling guard and audit CCTV coverages around %s corridors.", block);
                        break;
                    default:
                        description = String.format("Recurring pattern of %s complaints detected in %s.", category, block);
                        recommendation = String.format("Initiate management review of common service requests in %s.", block);
                        break;
                }

                results.add(new PredictionResult(category, block, riskScore, description, recommendation));
            }
        }

        results.sort(Comparator.comparingDouble(PredictionResult::recurrenceRiskScore).reversed());
        return results;
    }

    private String extractBlock(String flatNumber) {
        if (flatNumber == null || flatNumber.trim().isEmpty()) {
            return "General Block";
        }
        String flatLower = flatNumber.toLowerCase();
        if (flatLower.contains("block")) {
            return flatNumber;
        }
        if (flatNumber.contains("-")) {
            String[] parts = flatNumber.split("-");
            if (parts.length > 1) {
                return "Block " + parts[1].trim().toUpperCase();
            }
        }
        char last = flatNumber.charAt(flatNumber.length() - 1);
        if (Character.isLetter(last)) {
            return "Block " + Character.toUpperCase(last);
        }
        return "General Block";
    }
}
