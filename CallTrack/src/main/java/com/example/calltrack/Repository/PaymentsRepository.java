package com.example.calltrack.Repository;

import com.example.calltrack.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentsRepository extends JpaRepository<Payment, Long> {
    //String addPayment(Payment payment);
}
