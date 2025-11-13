package com.example.calltrack.Repository;

import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.PhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhoneNumberRepository extends JpaRepository<PhoneNumber, Long> {
    List<PhoneNumber> findAllByClient(Client client);
    List<PhoneNumber> findAllByClient_ClientId(Long clientId);
    Optional<PhoneNumber> findByPhone(String phone);
}
