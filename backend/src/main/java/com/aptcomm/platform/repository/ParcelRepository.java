package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.Parcel;
import com.aptcomm.platform.model.ParcelStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    List<Parcel> findByResidentIdOrderByReceivedAtDesc(Long residentId);
    List<Parcel> findByResidentIdAndStatusOrderByReceivedAtDesc(Long residentId, ParcelStatus status);
    List<Parcel> findByStatusOrderByReceivedAtDesc(ParcelStatus status);
    List<Parcel> findAllByOrderByReceivedAtDesc();
}
