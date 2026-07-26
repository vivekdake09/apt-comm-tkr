package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.VisitorDto.VisitorRequest;
import com.aptcomm.platform.model.*;
import com.aptcomm.platform.repository.UserRepository;
import com.aptcomm.platform.repository.VisitorRepository;
import com.aptcomm.platform.repository.VehicleLogRepository;
import com.aptcomm.platform.service.QrCodeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    @Autowired
    private VisitorRepository visitorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleLogRepository vehicleLogRepository;

    @Autowired
    private QrCodeService qrCodeService;

    @GetMapping
    public ResponseEntity<List<Visitor>> listVisitors() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.RESIDENT) {
            return ResponseEntity.ok(visitorRepository.findByResidentIdOrderByCreatedAtDesc(userId));
        } else {
            return ResponseEntity.ok(visitorRepository.findAllByOrderByCreatedAtDesc());
        }
    }

    @PostMapping("/pre-approve")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<?> preApprove(@Valid @RequestBody VisitorRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User resident = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found"));

        String qrToken = "QR_TOK_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        Visitor visitor = Visitor.builder()
                .resident(resident)
                .name(request.name())
                .phone(request.phone())
                .purpose(request.purpose())
                .vehicleNumber(request.vehicleNumber())
                .qrCodeToken(qrToken)
                .status(VisitorStatus.APPROVED)
                .build();

        Visitor saved = visitorRepository.save(visitor);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/qr-pass")
    public ResponseEntity<?> getQrPass(@PathVariable Long id) {
        Visitor visitor = visitorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visitor record not found"));

        String base64Qr = qrCodeService.generateQrCodeBase64(visitor.getQrCodeToken(), 250, 250);
        
        Map<String, String> response = new HashMap<>();
        response.put("qrCodeToken", visitor.getQrCodeToken());
        response.put("qrCodeBase64", "data:image/png;base64," + base64Qr);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/qr/{token}")
    @PreAuthorize("hasAnyRole('SECURITY', 'ADMIN')")
    public ResponseEntity<?> validateQrToken(@PathVariable String token) {
        Visitor visitor = visitorRepository.findByQrCodeToken(token)
                .orElse(null);
        if (visitor == null) {
            return ResponseEntity.status(404).body("Invalid or unrecognized QR token");
        }
        return ResponseEntity.ok(visitor);
    }

    @PostMapping("/qr/{token}/check-in")
    @PreAuthorize("hasAnyRole('SECURITY', 'ADMIN')")
    public ResponseEntity<?> checkIn(@PathVariable String token) {
        Visitor visitor = visitorRepository.findByQrCodeToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Visitor not found"));

        if (visitor.getStatus() == VisitorStatus.CHECKED_IN) {
            return ResponseEntity.badRequest().body("Visitor is already checked in");
        }

        visitor.setStatus(VisitorStatus.CHECKED_IN);
        visitor.setCheckInTime(LocalDateTime.now());
        visitor.setCheckOutTime(null);
        Visitor updated = visitorRepository.save(visitor);

        if (visitor.getVehicleNumber() != null && !visitor.getVehicleNumber().trim().isEmpty()) {
            VehicleLog log = VehicleLog.builder()
                    .vehicleNumber(visitor.getVehicleNumber())
                    .driverName(visitor.getName())
                    .visitor(visitor)
                    .build();
            vehicleLogRepository.save(log);
        }

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/qr/{token}/check-out")
    @PreAuthorize("hasAnyRole('SECURITY', 'ADMIN')")
    public ResponseEntity<?> checkOut(@PathVariable String token) {
        Visitor visitor = visitorRepository.findByQrCodeToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Visitor not found"));

        if (visitor.getStatus() != VisitorStatus.CHECKED_IN) {
            return ResponseEntity.badRequest().body("Visitor is not checked in");
        }

        visitor.setStatus(VisitorStatus.CHECKED_OUT);
        visitor.setCheckOutTime(LocalDateTime.now());
        Visitor updated = visitorRepository.save(visitor);

        if (visitor.getVehicleNumber() != null && !visitor.getVehicleNumber().trim().isEmpty()) {
            List<VehicleLog> logs = vehicleLogRepository.findByExitTimeIsNull();
            for (VehicleLog log : logs) {
                if (log.getVisitor() != null && log.getVisitor().getId().equals(visitor.getId())) {
                    log.setExitTime(LocalDateTime.now());
                    vehicleLogRepository.save(log);
                }
            }
        }

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasAnyRole('SECURITY', 'ADMIN')")
    public ResponseEntity<?> logWalkIn(@Valid @RequestBody VisitorRequest request) {
        String qrToken = "WALK_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        Visitor visitor = Visitor.builder()
                .resident(null)
                .name(request.name())
                .phone(request.phone())
                .purpose(request.purpose())
                .vehicleNumber(request.vehicleNumber())
                .qrCodeToken(qrToken)
                .status(VisitorStatus.CHECKED_IN)
                .checkInTime(LocalDateTime.now())
                .build();

        Visitor saved = visitorRepository.save(visitor);

        if (request.vehicleNumber() != null && !request.vehicleNumber().trim().isEmpty()) {
            VehicleLog log = VehicleLog.builder()
                    .vehicleNumber(request.vehicleNumber())
                    .driverName(request.name())
                    .visitor(saved)
                    .build();
            vehicleLogRepository.save(log);
        }

        return ResponseEntity.ok(saved);
    }
}
