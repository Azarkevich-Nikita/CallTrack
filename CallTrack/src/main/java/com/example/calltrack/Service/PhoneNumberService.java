package com.example.calltrack.Service;

import com.example.calltrack.DTO.PhoneNumberRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Repository.PhoneNumberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PhoneNumberService {
    private final PhoneNumberRepository phoneNumberRepository;
    private final ClientService clientService;

    public PhoneNumberService(PhoneNumberRepository phoneNumberRepository, ClientService clientService) {
        this.phoneNumberRepository = phoneNumberRepository;
        this.clientService = clientService;
    }

    public ResponseEntity<List<PhoneNumber>> getAll() {
        return ResponseEntity.ok(phoneNumberRepository.findAll());
    }

    public ResponseEntity<List<PhoneNumber>> getByClient(Client client) {
        return ResponseEntity.ok(phoneNumberRepository.findAllByClient(client));
    }

    public ResponseEntity<List<PhoneNumber>> getByClientId(Long clientId) {
        return ResponseEntity.ok(phoneNumberRepository.findAllByClient_ClientId(clientId));
    }

    public List<PhoneNumber> findByClientId(Long clientId) {
        return phoneNumberRepository.findAllByClient_ClientId(clientId);
    }

    public Optional<Client> findClientByPhone(String phone) {
        return phoneNumberRepository.findByPhone(phone)
                .map(PhoneNumber::getClient);
    }

    public ResponseEntity<String> deletePhoneNumber(Long id) {
        return phoneNumberRepository.findById(id)
                .map(phone -> {
                    phoneNumberRepository.delete(phone);
                    return ResponseEntity.ok("Phone number deleted successfully");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<String> registerPhoneNumber(PhoneNumberRequestDTO phoneNumberRequestDTO) {
        Client client = clientService.findClientById(phoneNumberRequestDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        boolean isPrimary = findByClientId(client.getClientId()).isEmpty();

        phoneNumberRepository.save(PhoneNumber.builder()
                .phone(phoneNumberRequestDTO.getPhone())
                .isPrimary(isPrimary)
                .client(client)
                .numberName(phoneNumberRequestDTO.getNumberName())
                .activatedAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok("Phone number registered successfully");
    }
}
