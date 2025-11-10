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
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "phone", nullable = false, unique = true)
    private String phone;
}
