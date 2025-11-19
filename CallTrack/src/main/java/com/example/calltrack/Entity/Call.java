package com.example.calltrack.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "call_record")
public class Call {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "call_id")
    private Long callId;

    @ManyToOne
    @JoinColumn(name = "number_id", nullable = false)
    private PhoneNumber phoneNumber;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "call_type")
    private String callType;

    @ManyToOne
    @JoinColumn(name = "tariff_id")
    private Tarif tarif;

    @Column(name = "cost")
    private BigDecimal cost;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;
}
