package com.example.calltrack.Service;

import com.example.calltrack.DTO.PaymentRequestDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class PaymentService {
    public String addPayments(@RequestBody PaymentRequestDTO paymentRequestDTO) {



        return "Done!";
    }
}
