package com.example.calltrack.Controller;

import com.example.calltrack.DTO.CallRequestDTO;
import com.example.calltrack.Entity.Call;
import com.example.calltrack.Service.CallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CallController {
    private final CallService callService;

    public CallController(CallService callService) {
        this.callService = callService;
    }

    @GetMapping("/calls")
    public ResponseEntity<List<Call>> getCalls() {
        return callService.getCalls().isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(callService.getCalls());
    }

    @PostMapping("/reg/call")
    public ResponseEntity<Call> addCall(@RequestBody CallRequestDTO call) {
        return callService.addCall(call);
    }
}
