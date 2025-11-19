package com.example.calltrack.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "phone_number")
@Builder
public class PhoneNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "number_id")
    private Long numberId;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "number_name")
    private String numberName;

    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt = LocalDateTime.now();

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "number_balance")
    private BigDecimal numberBalance;

    @ManyToOne
    @JoinColumn(name = "tarif_id")
    private Tarif tarif;
}
