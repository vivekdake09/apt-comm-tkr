package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.VehicleLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleLogRepository extends JpaRepository<VehicleLog, Long> {
    List<VehicleLog> findByExitTimeIsNull();
    List<VehicleLog> findAllByOrderByEntryTimeDesc();
}
