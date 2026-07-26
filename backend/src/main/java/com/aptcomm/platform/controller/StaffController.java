package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.StaffDto.StaffRequest;
import com.aptcomm.platform.model.Staff;
import com.aptcomm.platform.model.StaffRole;
import com.aptcomm.platform.model.StaffStatus;
import com.aptcomm.platform.repository.StaffRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;

    @GetMapping
    public ResponseEntity<List<Staff>> listStaff() {
        return ResponseEntity.ok(staffRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addStaff(@Valid @RequestBody StaffRequest request) {
        StaffRole role;
        StaffStatus status;
        try {
            role = StaffRole.valueOf(request.role().toUpperCase());
            status = StaffStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role or status specified");
        }

        Staff staff = Staff.builder()
                .name(request.name())
                .role(role)
                .phone(request.phone())
                .status(status)
                .build();

        Staff saved = staffRepository.save(staff);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @Valid @RequestBody StaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        StaffRole role;
        StaffStatus status;
        try {
            role = StaffRole.valueOf(request.role().toUpperCase());
            status = StaffStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role or status specified");
        }

        staff.setName(request.name());
        staff.setRole(role);
        staff.setPhone(request.phone());
        staff.setStatus(status);

        Staff updated = staffRepository.save(staff);
        return ResponseEntity.ok(updated);
    }
}
