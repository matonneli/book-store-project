package com.example.bookstore.service;

import com.example.bookstore.config.PasswordUtils;
import com.example.bookstore.model.Client;
import com.example.bookstore.repository.ClientRepository;
import com.example.bookstore.security.JwtUtils;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final JwtUtils jwtUtils;
    private final Set<String> invalidatedTokens = new HashSet<>();

    public ClientService(ClientRepository clientRepository, JwtUtils jwtUtils) {
        this.clientRepository = clientRepository;
        this.jwtUtils = jwtUtils;
    }

    public Map<String, String> authenticateUser(Client loginClient) {
        Map<String, String> response = new HashMap<>();
        String email = loginClient.getEmail();
        String password = loginClient.getPassword();
        Optional<Client> clientOptional = clientRepository.findByEmail(email);

        if (clientOptional.isPresent() && PasswordUtils.checkPassword(password, clientOptional.get().getPassword())) {
            String token = jwtUtils.generateToken(email);
            response.put("token", token);
            return response;
        } else {
            response.put("message", "Invalid email or password.");
            return response;
        }
    }

    public Map<String, String> logoutUser(String token) {
        Map<String, String> response = new HashMap<>();

        try {
            String jwtToken = token.replace("Bearer ", "");

            if (!jwtUtils.validateToken(jwtToken)) {
                response.put("message", "Invalid or expired token.");
                return response;
            }

            invalidatedTokens.add(jwtToken);

            response.put("message", "Logout successful");
            return response;
        } catch (Exception e) {
            response.put("message", "Logout failed: " + e.getMessage());
            return response;
        }
    }
    public boolean isTokenInvalidated(String token) {
        return invalidatedTokens.contains(token);
    }

    public Map<String, String> registerUser(Client newClient) {
        Map<String, String> response = new HashMap<>();

        if (clientRepository.findByEmail(newClient.getEmail()).isPresent()) {
            response.put("message", "User already exists.");
            return response;
        }

        try {
            newClient.setPassword(PasswordUtils.hashPassword(newClient.getPassword()));
            newClient.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
            clientRepository.save(newClient);
            response.put("message", "User registered successfully!");
            return response;
        } catch (Exception e) {
            response.put("message", "Registration failed due to an error.");
            return response;
        }
    }

    public Map<String, Object> getCurrentUserInfo(String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtils.validateToken(jwtToken) || isTokenInvalidated(jwtToken)) {
                response.put("message", "Invalid or expired token.");
                return response;
            }

            String email = jwtUtils.getEmailFromToken(jwtToken);
            Optional<Client> client = findByEmail(email);

            if (client.isPresent()) {
                Client clientData = client.get();
                response.put("id", clientData.getUserId());
                response.put("email", clientData.getEmail());
                response.put("firstName", clientData.getFirstName());
                response.put("lastName", clientData.getLastName());
                response.put("createdAt", clientData.getCreatedAt());
            } else {
                response.put("message", "User not found.");
            }

            return response;
        } catch (Exception e) {
            response.put("message", "Invalid token.");
            return response;
        }
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> findByEmail(String email) {
        return clientRepository.findByEmail(email);
    }

    public boolean isAuthenticated(Client loginClient) {
        String email = loginClient.getEmail();
        String password = loginClient.getPassword();
        Optional<Client> clientOptional = clientRepository.findByEmail(email);
        return clientOptional.map(client -> PasswordUtils.checkPassword(password, client.getPassword())).orElse(false);
    }
}