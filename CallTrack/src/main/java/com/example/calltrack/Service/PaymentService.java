package com.example.calltrack.Service;

import com.example.calltrack.DTO.PaymentRequestDTO;
import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.Payment;
import com.example.calltrack.Repository.PaymentsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class PaymentService {

    private final PaymentsRepository paymentsRepository;
    private final PhoneNumberService phoneNumberService;
    private final ClientService clientService;


    public PaymentService(PaymentsRepository paymentsRepository, PhoneNumberService phoneNumberService, ClientService clientService) {
        this.paymentsRepository = paymentsRepository;
        this.phoneNumberService = phoneNumberService;
        this.clientService = clientService;
    }

    public ResponseEntity<String> addPaymentsOnNumber(PaymentRequestDTO paymentRequestDTO) {
        boolean response = phoneNumberService.updatePhoneNumberBalance(paymentRequestDTO.getPhoneId(), paymentRequestDTO.getAmount());
        if (response) {
            response = clientService.updatePhoneBalance(paymentRequestDTO.getClientId(), paymentRequestDTO.getAmount());
        }

        Client client = clientService.findClientById(paymentRequestDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        Payment peyment = Payment.builder()
                .client(client)
                .amount(paymentRequestDTO.getAmount())
                .balanceAfter(clientService.getBalanceAfter(paymentRequestDTO.getClientId()))
                .createdAt(LocalDateTime.now())
                .paymentMethod(paymentRequestDTO.getPaymentType())
                .phone_number(phoneNumberService.getPhoneNumberById(paymentRequestDTO.getPhoneId()))
                .build();

        paymentsRepository.save(peyment);
        return response ? ResponseEntity.ok("Add phone number successfully") : ResponseEntity.badRequest().build();
    }

    public List<Payment> getPaymentsByClientId(Long clientId) {
        List<Payment> payments =  paymentsRepository.findAllByClient_ClientId(clientId);
        payments.sort(Comparator.comparing(Payment::getCreatedAt).reversed());
        return payments;
    }
}
