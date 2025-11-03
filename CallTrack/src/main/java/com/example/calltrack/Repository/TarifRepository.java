package com.example.calltrack.Repository;

import com.example.calltrack.Entity.Tarif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarifRepository extends JpaRepository<Tarif, Long>{
    public List<Tarif> findAll();
}
