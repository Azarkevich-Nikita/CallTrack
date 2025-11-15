package com.example.calltrack.Service;

import com.example.calltrack.DTO.PaymentRequestDTO;
import com.example.calltrack.Repository.PaymentsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class PaymentService {

    private final PaymentsRepository paymentsRepository;

    public PaymentService(PaymentsRepository paymentsRepository) {
        this.paymentsRepository = paymentsRepository;
    }

    public ResponseEntity<String> addPaymentsOnNumber(PaymentRequestDTO paymentRequestDTO) {

        return ResponseEntity.ok("Add phone number successfully");
    }
}
