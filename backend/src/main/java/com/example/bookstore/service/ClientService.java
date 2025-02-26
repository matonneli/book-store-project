package com.example.bookstore.service;

import com.example.bookstore.config.PasswordUtils;
import com.example.bookstore.model.Client;
import com.example.bookstore.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public boolean authenticateUser(Client loginClient) {
        String email = loginClient.getEmail();
        String password = loginClient.getPassword();
        Optional<Client> clientOptional = clientRepository.findByEmail(email);
        return clientOptional.map(client -> PasswordUtils.checkPassword(password, client.getPassword())).orElse(false);
    }
    public Client registerUser(Client newClient){
        if (clientRepository.findByEmail(newClient.getEmail()).isPresent()) {
            return null;
        }
        newClient.setPassword(PasswordUtils.hashPassword(newClient.getPassword()));
        newClient.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        return clientRepository.save(newClient);
    }
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> findByEmail(String email){
        return clientRepository.findByEmail(email);
    }
}
