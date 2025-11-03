package com.example.calltrack.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tariff")
public class Tarif {
    @Id
    @GeneratedValue
    @Column(name = "tariff_id")
    private Long tariffId;

    @Column(name = "tariff_name")
    private String tariffName;

    @Column(name = "tariff_type")
    private String tariffType;

    @Column(name = "price_per_minute")
    private Double pricePerMinute;

    @Column(name = "currency")
    private String currency;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;
}
