package com.example.calltrack.Controller;

import com.example.calltrack.DTO.ClientRequestDTO;
import com.example.calltrack.DTO.PhoneNumberRequestDTO;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Repository.PhoneNumberRepository;
import com.example.calltrack.Service.PhoneNumberService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PhoneNumberController {
    private final PhoneNumberService phoneNumberService;

    public PhoneNumberController(PhoneNumberService phoneNumberService) {
        this.phoneNumberService = phoneNumberService;
    }

    @PostMapping("/registerNewPhone")
    public ResponseEntity<String> registerNewPhone(@RequestBody PhoneNumberRequestDTO phoneNumberRequestDTO) {
        return  phoneNumberService.registerPhoneNumber(phoneNumberRequestDTO);
    }
}
