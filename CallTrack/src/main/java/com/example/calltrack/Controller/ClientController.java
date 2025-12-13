package com.example.calltrack.Controller;

import com.example.calltrack.DTO.ClientRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.Payment;
import com.example.calltrack.Service.ClientService;
import com.example.calltrack.Service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ClientController {
    private final ClientService clientService;
    private final PaymentService paymentService;

    public ClientController(ClientService clientService, PaymentService paymentService) {
        this.clientService = clientService;
        this.paymentService = paymentService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<String> registerClient(@RequestBody ClientRequestDTO clientRequestDTO) {
        return clientService.addNewClient(clientRequestDTO);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> loginClient(@RequestBody ClientRequestDTO clientRequestDTO) {
        return  clientService.loginClient(clientRequestDTO);
    }

    @GetMapping("/clients/payments/recent")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/clients/{id}/payments/recent")
    public ResponseEntity<List<Payment>> getRecentPayments(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentsByClientId(id));
    }

    @GetMapping("/clients/debts")
    public List<Client> getRecentPayments() {
        return clientService.getDebtsClients();
    }

    @GetMapping("/clients/{id}/debt")
    public Boolean isDebtClient(@PathVariable Long id) {
        return clientService.checkDebtClient(id);
    }

}
