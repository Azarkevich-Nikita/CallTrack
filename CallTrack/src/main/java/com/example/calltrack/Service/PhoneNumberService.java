package com.example.calltrack.Service;

import com.example.calltrack.DTO.PhoneNumberRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Repository.PhoneNumberRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PhoneNumberService {
    private final PhoneNumberRepository phoneNumberRepository;

    public PhoneNumberService(PhoneNumberRepository phoneNumberRepository) {
        this.phoneNumberRepository = phoneNumberRepository;
    }

    public ResponseEntity<List<PhoneNumber>> getAll() {
        return ResponseEntity.ok(phoneNumberRepository.findAll());
    }

//    public ResponseEntity<List<PhoneNumber>> getByPClientId(Client client) {
//        return ResponseEntity.ok(phoneNumberRepository.findAllById(client);
//    }

    public ResponseEntity<String> registerPhoneNumber(PhoneNumberRequestDTO phoneNumberRequestDTO) {
        phoneNumberRepository.save(PhoneNumber.builder()
                .phone(phoneNumberRequestDTO.getPhone())
                .isPrimary(true)
                .client(phoneNumberRequestDTO.getClient())
                .build());
        return ResponseEntity.ok().build();
    }
}
