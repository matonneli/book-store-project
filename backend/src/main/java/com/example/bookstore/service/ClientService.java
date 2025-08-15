package com.example.bookstore.service;

import com.example.bookstore.config.PasswordUtils;
import com.example.bookstore.dto.ClientProfileDto;
import com.example.bookstore.dto.LoginResponseDto;
import com.example.bookstore.dto.UserBasicInfoDto;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.model.Client;
import com.example.bookstore.repository.ClientRepository;
import com.example.bookstore.security.JwtUtils;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final JwtUtils jwtUtils;
    private final AuthService authService;

    public ClientService(ClientRepository clientRepository, JwtUtils jwtUtils, AuthService authService) {
        this.clientRepository = clientRepository;
        this.jwtUtils = jwtUtils;
        this.authService = authService;
    }

    public LoginResponseDto authenticateUser(Client loginClient) {
        String email = loginClient.getEmail();
        String password = loginClient.getPassword();
        Optional<Client> clientOptional = clientRepository.findByEmail(email);

        if (clientOptional.isPresent() && PasswordUtils.checkPassword(password, clientOptional.get().getPassword())) {
            Client client = clientOptional.get();
            String token = jwtUtils.generateToken(email);

            UserBasicInfoDto userInfo = new UserBasicInfoDto(
                    client.getFirstName(),
                    client.getLastName(),
                    client.getEmail()
            );

            return new LoginResponseDto(token, userInfo, "Login successful");
        } else {
            return new LoginResponseDto(null, null, "Invalid email or password.");
        }
    }

    public Map<String, String> logoutUser(String token) {
        Map<String, String> response = new HashMap<>();

        try {
            String jwtToken = authService.extractToken(token);

            if (!jwtUtils.validateToken(jwtToken)) {
                response.put("message", "Invalid or expired token.");
                return response;
            }
            authService.invalidateToken(token);
            response.put("message", "Logout successful");
            return response;
        } catch (Exception e) {
            response.put("message", "Logout failed: " + e.getMessage());
            return response;
        }
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

    public ClientProfileDto getCurrentUserInfo(String token) {
        Client client = authService.getClientFromToken(token);
        ClientProfileDto dto = new ClientProfileDto();
        dto.setEmail(client.getEmail());
        dto.setFirstName(client.getFirstName());
        dto.setLastName(client.getLastName());
        dto.setContactPhone(client.getContactPhone());
        dto.setCreatedAt(client.getCreatedAt());
        return dto;
    }

    public ClientProfileDto updateUser(String token, ClientProfileDto updateDto) {
        Client client = authService.getClientFromToken(token);
        if (!client.getEmail().equals(updateDto.getEmail())) {
            Optional<Client> existingClient = clientRepository.findByEmail(updateDto.getEmail());
            if (existingClient.isPresent()) {
                throw new IllegalArgumentException("Email already exists.");
            }
        }
        client.setFirstName(updateDto.getFirstName());
        client.setLastName(updateDto.getLastName());
        client.setEmail(updateDto.getEmail());
        client.setContactPhone(updateDto.getContactPhone());
        Client updatedClient = clientRepository.save(client);
        ClientProfileDto responseDto = new ClientProfileDto();
        responseDto.setEmail(updatedClient.getEmail());
        responseDto.setFirstName(updatedClient.getFirstName());
        responseDto.setLastName(updatedClient.getLastName());
        responseDto.setContactPhone(updatedClient.getContactPhone());
        responseDto.setCreatedAt(updatedClient.getCreatedAt());
        return responseDto;
    }

    public void changePassword(String token, String currentPassword, String newPassword) {
        Client client = authService.getClientFromToken(token);
        if (!PasswordUtils.checkPassword(currentPassword, client.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }
        String hashedNewPassword = PasswordUtils.hashPassword(newPassword);
        client.setPassword(hashedNewPassword);
        clientRepository.save(client);
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