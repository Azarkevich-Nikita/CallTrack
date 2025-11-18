package com.example.calltrack.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CallRequestDTO {
    String phoneNumber;
    String callType;
    Integer durationMinutes;
    LocalDate startDate;
    String comment;
}
