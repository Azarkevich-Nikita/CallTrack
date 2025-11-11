package com.example.calltrack.DTO;

import com.example.calltrack.Entity.Client;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhoneNumberRequestDTO {
    private Long clientId;
    private String numberName;
    private String phone;
}
