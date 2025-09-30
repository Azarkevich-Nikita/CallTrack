package com.example.calltrack.Repository;

import com.example.calltrack.Entity.PhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhoneNumberRepository extends JpaRepository<PhoneNumber, Long> {
    PhoneNumber findByPhone(String phone);
}
