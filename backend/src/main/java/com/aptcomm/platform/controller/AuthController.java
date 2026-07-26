package com.aptcomm.platform.controller;

import com.aptcomm.platform.config.JwtUtils;
import com.aptcomm.platform.dto.AuthDto.*;
import com.aptcomm.platform.model.Role;
import com.aptcomm.platform.model.User;
import com.aptcomm.platform.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Role userRole;
        try {
            userRole = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role specified. Must be ADMIN, RESIDENT, or SECURITY");
        }

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .email(request.email())
                .fullName(request.fullName())
                .phone(request.phone())
                .role(userRole)
                .flatNumber(request.flatNumber())
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("Registration successful. You can now log in.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        
        AuthResponse response = new AuthResponse(
                token,
                user.getUsername(),
                user.getRole().name(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getFlatNumber()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String username) {
            User user = userRepository.findByUsername(username)
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            AuthResponse response = new AuthResponse(
                    null,
                    user.getUsername(),
                    user.getRole().name(),
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getFlatNumber()
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Not authenticated");
    }

    @GetMapping("/residents")
    public ResponseEntity<?> getResidents() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.aptcomm.platform.model.Role.RESIDENT)
                .map(u -> new AuthResponse(
                        null,
                        u.getUsername(),
                        u.getRole().name(),
                        u.getId(),
                        u.getEmail(),
                        u.getFullName(),
                        u.getFlatNumber()
                ))
                .toList());
    }
}
