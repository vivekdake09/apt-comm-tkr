package com.aptcomm.platform.repository;

import com.aptcomm.platform.model.Staff;
import com.aptcomm.platform.model.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByRole(StaffRole role);
}
