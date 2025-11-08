package com.example.calltrack.Service;

import com.example.calltrack.DTO.ClientRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Repository.ClientRepository;
import com.example.calltrack.Repository.PhoneNumberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public ClientService(PhoneNumberRepository phoneNumberRepository,
                         ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public Client getClientByNEmail(String email) {
        System.out.println(clientRepository.findByEmail(email));
        return clientRepository.findByEmail(email);
    }

    public ResponseEntity<String> addNewClient(ClientRequestDTO clientDTO) {
        if (getClientByNEmail(clientDTO.getEmail()) != null) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Client already exists");
        }

        Client client = Client.builder()
                .fullName(clientDTO.getFullName())
                .birthDate(clientDTO.getBirthDate())
                .email(clientDTO.getEmail())
                .password(passwordEncoder.encode(clientDTO.getPassword()))
                .balance(0.0)
                .status("USER")
                .allowedCreditMinutes(0)
                .createdAt(LocalDateTime.now())
                .build();

        clientRepository.save(client);

        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }

}
