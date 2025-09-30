package com.example.calltrack.Controller;

import com.example.calltrack.Service.ClientService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }


    @GetMapping("/clients/{number}")
    public String getClientByNumber(@PathVariable String number) {
        return clientService.getClientByNumber(number);
    }
}
