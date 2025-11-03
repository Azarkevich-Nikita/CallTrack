package com.example.calltrack.Service;

import com.example.calltrack.Entity.Tarif;
import com.example.calltrack.Repository.TarifRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TarifService {

    private final TarifRepository tarifRepository;
    public TarifService(TarifRepository tarifRepository) {
        this.tarifRepository = tarifRepository;
    }

    public List<Tarif> findAll() {
        return tarifRepository.findAll();
    }
}
