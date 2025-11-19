package com.example.calltrack.Service;

import com.example.calltrack.DTO.CallRequestDTO;
import com.example.calltrack.Entity.Call;
import com.example.calltrack.Repository.CallRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class CallService {
    private final CallRepository callRepository;
    private final PhoneNumberService phoneNumberService;

    public CallService(CallRepository callRepository, PhoneNumberService phoneNumberService) {
        this.callRepository = callRepository;
        this.phoneNumberService = phoneNumberService;
    }

    public List<Call> getCalls() {
        List<Call> calls = callRepository.findAll();
        calls.sort(Comparator.comparing(Call::getStartedAt).reversed());
        return calls;
    }

    public ResponseEntity<Call> addCall(CallRequestDTO call) {
        try{
            Call currentCall = Call.builder()
                    .phoneNumber(phoneNumberService.getByPhone(call.getPhoneNumber()))
                    .startedAt(call.getStartDate().atStartOfDay())
                    .callType(call.getCallType())
                    .tarif(phoneNumberService.getTarifByNumber(call.getPhoneNumber()))
                    .cost(phoneNumberService.getTarifByNumber(call.getPhoneNumber()).getPricePerMinute()
                            .multiply(BigDecimal.valueOf(call.getDurationMinutes())))
                    .durationMinutes(call.getDurationMinutes())
                    .build();
            callRepository.save(currentCall);
            return  new ResponseEntity<>(currentCall, HttpStatus.CREATED);

        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
