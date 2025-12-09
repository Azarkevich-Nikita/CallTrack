package com.example.calltrack.Service;

import com.example.calltrack.DTO.PhoneNumberRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Entity.Tarif;
import com.example.calltrack.Repository.PhoneNumberRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
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
        List<PhoneNumber> numbers = phoneNumberRepository.findAllByClient_ClientId(clientId);
        numbers.sort(Comparator.comparing(PhoneNumber::getNumberId));
        return ResponseEntity.ok(numbers);
    }

    public List<PhoneNumber> findByClientId(Long clientId) {
        return phoneNumberRepository.findAllByClient_ClientId(clientId);
    }

    public Optional<Client> findClientByPhone(String phone) {
        return phoneNumberRepository.findByPhone(phone)
                .map(PhoneNumber::getClient);
    }

    public ResponseEntity<String> deletePhoneNumber(Long phoneNumberId) {

        PhoneNumber phone = phoneNumberRepository.findById(phoneNumberId)
                .orElse(null);

        if (phone == null) {
            return ResponseEntity.notFound().build();
        }

        List<PhoneNumber> phoneNumbers =
                phoneNumberRepository.findAllByClient_ClientId(phone.getClient().getClientId());

        phoneNumbers.remove(phone);

        if (!phoneNumbers.isEmpty()) {
            PhoneNumber receiver = phoneNumbers.get(0);
            receiver.setNumberBalance(
                    receiver.getNumberBalance().add(phone.getNumberBalance())
            );
            phoneNumberRepository.save(receiver);
        }

        phoneNumberRepository.delete(phone);

        return ResponseEntity.ok("Phone number deleted successfully");
    }


    public ResponseEntity<String> registerPhoneNumber(PhoneNumberRequestDTO phoneNumberRequestDTO) {
        Client client = clientService.findClientById(phoneNumberRequestDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        boolean isPrimary = findByClientId(client.getClientId()).isEmpty();

        phoneNumberRepository.save(PhoneNumber.builder()
                .phone(phoneNumberRequestDTO.getPhone())
                .isPrimary(isPrimary)
                .client(client)
                .numberBalance(BigDecimal.ZERO)
                .numberName(phoneNumberRequestDTO.getNumberName())
                .activatedAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok("Phone number registered successfully");
    }

    @Transactional
    public boolean updatePhoneNumberBalance(Long phone_id, BigDecimal amount) {
        try {
            PhoneNumber current_phone = phoneNumberRepository.findById(phone_id).orElseThrow();

            current_phone.setNumberBalance(
                    current_phone.getNumberBalance().add(amount)
            );

            phoneNumberRepository.save(current_phone);

            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    public PhoneNumber getByPhone(String phone) {
        return  phoneNumberRepository.findByPhone(phone).orElseThrow();
    }

    public Tarif getTarifByNumber(String number) {
        return phoneNumberRepository.findByPhone(number).get().getTarif();
    }
    public PhoneNumber getByPhoneId(Long phone_id) {
        return phoneNumberRepository.findById(phone_id).orElseThrow();
    }
    public String getPhoneNumberById(Long phone_id) {
        return phoneNumberRepository.findById(phone_id).get().getPhone();
    }

}
