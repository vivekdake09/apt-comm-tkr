package com.aptcomm.platform.controller;

import com.aptcomm.platform.dto.BookingDto.BookingRequest;
import com.aptcomm.platform.model.*;
import com.aptcomm.platform.repository.BookingRepository;
import com.aptcomm.platform.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Booking>> listBookings() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.RESIDENT) {
            return ResponseEntity.ok(bookingRepository.findByResidentIdOrderByBookingDateDesc(userId));
        } else {
            return ResponseEntity.ok(bookingRepository.findAllByOrderByBookingDateDesc());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<?> bookFacility(@Valid @RequestBody BookingRequest request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User resident = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FacilityName facilityName;
        try {
            facilityName = FacilityName.valueOf(request.facilityName().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid facility. Must be CLUBHOUSE, GYM, TENNIS_COURT, or PARTY_HALL");
        }

        LocalDate bookingDate = LocalDate.parse(request.bookingDate());
        LocalTime startTime = LocalTime.parse(request.startTime());
        LocalTime endTime = LocalTime.parse(request.endTime());

        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            return ResponseEntity.badRequest().body("Start time must be before end time");
        }

        List<Booking> activeBookings = bookingRepository.findByFacilityNameAndBookingDateAndStatus(
                facilityName, bookingDate, BookingStatus.CONFIRMED);

        for (Booking active : activeBookings) {
            if (startTime.isBefore(active.getEndTime()) && endTime.isAfter(active.getStartTime())) {
                return ResponseEntity.badRequest().body("Selected time slot overlaps with an existing confirmed booking");
            }
        }

        Booking booking = Booking.builder()
                .resident(resident)
                .facilityName(facilityName)
                .bookingDate(bookingDate)
                .startTime(startTime)
                .endTime(endTime)
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.ADMIN && !booking.getResident().getId().equals(userId)) {
            return ResponseEntity.status(403).body("You do not have permission to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}
