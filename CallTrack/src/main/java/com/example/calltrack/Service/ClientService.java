package com.example.calltrack.Service;

import org.springframework.stereotype.Service;

@Service
public class ClientService{
    public String getClientByNumber(String number) {

        

        return "Found! " + number;
    }
}
