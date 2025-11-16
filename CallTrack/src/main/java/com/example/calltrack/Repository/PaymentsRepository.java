package com.example.calltrack.Repository;

import com.example.calltrack.Entity.Payment;
import com.example.calltrack.Entity.PhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentsRepository extends JpaRepository<Payment, Long> {
    //String addPayment(Payment payment);
    List<Payment> findAllByClient_ClientId(Long clientId);
}
