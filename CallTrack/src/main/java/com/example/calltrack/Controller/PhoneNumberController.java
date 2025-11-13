package com.example.calltrack.Controller;

import com.example.calltrack.DTO.PhoneNumberRequestDTO;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Service.PhoneNumberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @DeleteMapping("/phone/{id}")
    public ResponseEntity<String> deletePhone(@PathVariable Long id) {
        return phoneNumberService.deletePhoneNumber(id);
    }

    @GetMapping("/phoneNumber/{id}")
    public ResponseEntity<List<PhoneNumber>> getPhoneNumber(@PathVariable Long id) {
        return phoneNumberService.getByClientId(id);
    }

}
