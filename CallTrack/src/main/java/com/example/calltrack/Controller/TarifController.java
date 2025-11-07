package com.example.calltrack.Controller;

import com.example.calltrack.Entity.Tarif;
import com.example.calltrack.Service.TarifService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class TarifController {

    private final TarifService tarifService;

    public TarifController(TarifService tarifRepository) {
        this.tarifService = tarifRepository;
    }

    @GetMapping("/tariffs")
    public List<Tarif> getTarif() {
        return tarifService.findAll();
    }
}
