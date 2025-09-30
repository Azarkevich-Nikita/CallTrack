package com.example.calltrack.Repository;

import com.example.calltrack.Entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Client findByClientId(Long clientId); // ищем по PK
}
