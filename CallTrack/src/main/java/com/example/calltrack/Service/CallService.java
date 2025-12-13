package com.example.calltrack.Service;

import com.example.calltrack.DTO.CallRequestDTO;
import com.example.calltrack.Entity.Call;
import com.example.calltrack.Repository.CallRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.example.calltrack.Entity.Call;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Entity.Tarif;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional // Добавляем транзакцию
    public ResponseEntity<Call> addCall(CallRequestDTO callRequestDTO) {
        String phoneNumberStr = callRequestDTO.getPhoneNumber();

        // 1. Получаем номер телефона ОДИН раз
        PhoneNumber existingPhoneNumber = phoneNumberService.getByPhone(phoneNumberStr);

        if (existingPhoneNumber == null) {
            return ResponseEntity.notFound().build();
        }

        // 2. Получаем тариф ОДИН раз из уже загруженного объекта
        // Убедитесь, что у сущности PhoneNumber есть метод getTarif()
        Tarif tariff = existingPhoneNumber.getTarif();

        if (tariff == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // 3. Рассчитываем стоимость ОДИН раз
        BigDecimal cost = tariff.getPricePerMinute()
                .multiply(BigDecimal.valueOf(callRequestDTO.getDurationMinutes()));

        // 4. Создаем объект и сохраняем его
        Call currentCall = Call.builder()
                .phoneNumber(existingPhoneNumber) // Используем переменную
                .startedAt(callRequestDTO.getStartDate().atStartOfDay())
                .callType(callRequestDTO.getCallType())
                .tarif(tariff) // Используем переменную
                .cost(cost)    // Используем переменную
                .durationMinutes(callRequestDTO.getDurationMinutes())
                .build();

        callRepository.saveAndFlush(currentCall);

        return new ResponseEntity<>(currentCall, HttpStatus.CREATED);
    }

}
