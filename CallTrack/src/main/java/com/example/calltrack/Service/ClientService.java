package com.example.calltrack.Service;

import com.example.calltrack.Entity.Client;
import com.example.calltrack.Entity.PhoneNumber;
import com.example.calltrack.Repository.ClientRepository;
import com.example.calltrack.Repository.PhoneNumberRepository;
import org.springframework.stereotype.Service;

@Service
public class ClientService {

    private final PhoneNumberRepository phoneNumberRepository;
    private final ClientRepository clientRepository;

    public ClientService(PhoneNumberRepository phoneNumberRepository,
                         ClientRepository clientRepository) {
        this.phoneNumberRepository = phoneNumberRepository;
        this.clientRepository = clientRepository;
    }

    public Client getClientByNumber(String number) {
        PhoneNumber phoneNumber = phoneNumberRepository.findByPhone(number);
        return phoneNumber != null ? phoneNumber.getClient() : null;
    }
}
