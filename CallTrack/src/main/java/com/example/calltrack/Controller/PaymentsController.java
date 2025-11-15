package com.example.calltrack.Controller;

import com.example.calltrack.DTO.PaymentRequestDTO;
import com.example.calltrack.Service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class PaymentsController {
    public final PaymentService paymentService;

    public PaymentsController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/payments/")
    public ResponseEntity<String> addPaymentsOnPhone(@RequestBody PaymentRequestDTO paymentRequestDTO) {
        return paymentService.addPaymentsOnNumber(paymentRequestDTO);
    }

}
