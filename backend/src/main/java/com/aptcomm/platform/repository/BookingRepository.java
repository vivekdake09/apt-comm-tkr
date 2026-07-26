package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.Booking;
import com.aptcomm.platform.model.BookingStatus;
import com.aptcomm.platform.model.FacilityName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByResidentIdOrderByBookingDateDesc(Long residentId);
    List<Booking> findByFacilityNameAndBookingDateAndStatus(FacilityName facilityName, LocalDate bookingDate, BookingStatus status);
    List<Booking> findAllByOrderByBookingDateDesc();
}
