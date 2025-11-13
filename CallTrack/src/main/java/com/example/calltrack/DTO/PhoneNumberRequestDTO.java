package com.example.calltrack.DTO;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class PhoneNumberRequestDTO {
    private Long clientId;
    private String numberName;
    private String phone;
}
