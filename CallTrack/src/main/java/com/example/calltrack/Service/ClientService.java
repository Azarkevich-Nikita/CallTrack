package com.example.calltrack.Service;

import com.example.calltrack.DTO.ClientRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Repository.ClientRepository;
import com.example.calltrack.Repository.PhoneNumberRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public ClientService(PhoneNumberRepository phoneNumberRepository,
                         ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public Optional<Client> findClientById(Long client_id){
        return clientRepository.findById(client_id);
    }

    public Client getClientByEmail(String email) {
        System.out.println(clientRepository.findByEmail(email));
        return clientRepository.findByEmail(email);
    }

    public ResponseEntity<String> addNewClient(ClientRequestDTO clientDTO) {
        if (getClientByEmail(clientDTO.getEmail()) != null) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Client already exists");
        }

        Client client = Client.builder()
                .fullName(clientDTO.getFullName())
                .birthDate(clientDTO.getBirthDate())
                .email(clientDTO.getEmail())
                .password(passwordEncoder.encode(clientDTO.getPassword()))
                .balance(BigDecimal.ZERO)
                .status("USER")
                .allowedCreditMinutes(0)
                .createdAt(LocalDateTime.now())
                .build();

        clientRepository.save(client);

        return ResponseEntity
                .status(HttpStatus.OK)
                .build();
    }

    public ResponseEntity<?> loginClient(ClientRequestDTO clientRequestDTO) {
        Client findingClient = clientRepository.findByEmail(clientRequestDTO.getEmail());
        if (findingClient == null) {
            System.out.println("Client not found" +  clientRequestDTO.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        else if(passwordEncoder.matches(clientRequestDTO.getPassword(), findingClient.getPassword())){
            return ResponseEntity.ok(Client.builder()
                    .clientId(findingClient.getClientId())
                    .fullName(findingClient.getFullName())
                    .email(findingClient.getEmail())
                    .balance(findingClient.getBalance())
                    .status(findingClient.getStatus())
                    .build());
        }
        System.out.println("Wrong password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Some think wrong!");
    }

    public BigDecimal getBalanceAfter(Long id) {
        return clientRepository.findById(id).orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND)).getBalance();
    }

    @Transactional
    public boolean updatePhoneBalance(Long client_id, BigDecimal amount) {
        Client client = clientRepository.findById(client_id).orElse(null);
        if (client != null) {
            client.setBalance(client.getBalance().add(amount));
            clientRepository.save(client);
        }
        else  {
            return false;
        }
        return true;
    }

}
