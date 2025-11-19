package com.example.calltrack.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Table(name = "tariff")
public class Tarif {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tariff_id")
    private Long tariffId;

    @Column(name = "tariff_name")
    private String tariffName;

    @Column(name = "tariff_type")
    private String tariffType;

    @Column(name = "price_per_minute")
    private BigDecimal pricePerMinute;

    @Column(name = "currency")
    private String currency;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;
}
