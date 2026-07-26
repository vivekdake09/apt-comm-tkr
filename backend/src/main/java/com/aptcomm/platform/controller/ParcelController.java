package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.ParcelDto.ParcelRequest;
import com.aptcomm.platform.model.*;
import com.aptcomm.platform.repository.ParcelRepository;
import com.aptcomm.platform.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/parcels")
public class ParcelController {

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Parcel>> listParcels() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.RESIDENT) {
            return ResponseEntity.ok(parcelRepository.findByResidentIdOrderByReceivedAtDesc(userId));
        } else {
            return ResponseEntity.ok(parcelRepository.findAllByOrderByReceivedAtDesc());
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SECURITY', 'ADMIN')")
    public ResponseEntity<?> logIncomingParcel(@Valid @RequestBody ParcelRequest request) {
        User resident = userRepository.findById(request.residentId())
                .orElse(null);
        if (resident == null || resident.getRole() != Role.RESIDENT) {
            return ResponseEntity.badRequest().body("Specified user must be a Resident");
        }

        Parcel parcel = Parcel.builder()
                .resident(resident)
                .carrier(request.carrier())
                .trackingNumber(request.trackingNumber())
                .status(ParcelStatus.RECEIVED)
                .build();

        Parcel saved = parcelRepository.save(parcel);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/collect")
    public ResponseEntity<?> markCollected(@PathVariable Long id) {
        Parcel parcel = parcelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parcel record not found"));

        if (parcel.getStatus() == ParcelStatus.COLLECTED) {
            return ResponseEntity.badRequest().body("Parcel has already been collected");
        }

        parcel.setStatus(ParcelStatus.COLLECTED);
        parcel.setCollectedAt(LocalDateTime.now());
        Parcel updated = parcelRepository.save(parcel);
        return ResponseEntity.ok(updated);
    }
}
