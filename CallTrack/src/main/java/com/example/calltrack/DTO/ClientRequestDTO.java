package com.example.calltrack.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClientRequestDTO {
    private String fullName;

    private LocalDate birthDate;

    private String email;

    private String password;
}
