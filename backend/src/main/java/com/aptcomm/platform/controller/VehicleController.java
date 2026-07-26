package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.VehicleDto.VehicleLogRequest;
import com.aptcomm.platform.model.VehicleLog;
import com.aptcomm.platform.model.Visitor;
import com.aptcomm.platform.repository.VehicleLogRepository;
import com.aptcomm.platform.repository.VisitorRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@PreAuthorize("hasAnyRole('SECURITY', 'ADMIN')")
public class VehicleController {

    @Autowired
    private VehicleLogRepository vehicleLogRepository;

    @Autowired
    private VisitorRepository visitorRepository;

    @GetMapping("/active")
    public ResponseEntity<List<VehicleLog>> listActiveVehicles() {
        return ResponseEntity.ok(vehicleLogRepository.findByExitTimeIsNull());
    }

    @GetMapping
    public ResponseEntity<List<VehicleLog>> listAllLogs() {
        return ResponseEntity.ok(vehicleLogRepository.findAllByOrderByEntryTimeDesc());
    }

    @PostMapping("/log-entry")
    public ResponseEntity<?> logEntry(@Valid @RequestBody VehicleLogRequest request) {
        Visitor visitor = null;
        if (request.visitorId() != null) {
            visitor = visitorRepository.findById(request.visitorId()).orElse(null);
        }

        VehicleLog log = VehicleLog.builder()
                .vehicleNumber(request.vehicleNumber())
                .driverName(request.driverName())
                .visitor(visitor)
                .build();

        VehicleLog saved = vehicleLogRepository.save(log);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/log-exit")
    public ResponseEntity<?> logExit(@PathVariable Long id) {
        VehicleLog log = vehicleLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle log not found"));

        if (log.getExitTime() != null) {
            return ResponseEntity.badRequest().body("Vehicle has already exited");
        }

        log.setExitTime(LocalDateTime.now());
        VehicleLog updated = vehicleLogRepository.save(log);
        return ResponseEntity.ok(updated);
    }
}
