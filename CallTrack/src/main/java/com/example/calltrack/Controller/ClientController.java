package com.example.calltrack.Controller;

import com.example.calltrack.DTO.ClientRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Service.ClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerClient(@RequestBody ClientRequestDTO clientRequestDTO) {
        return clientService.addNewClient(clientRequestDTO);
    }

}
