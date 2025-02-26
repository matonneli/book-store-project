package com.example.bookstore.controller;

import com.example.bookstore.model.Client;
import com.example.bookstore.security.JwtUtils;
import com.example.bookstore.service.ClientService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class ClientController {
    private final JwtUtils jwtUtils;
    private final ClientService clientService;
    @Autowired
    public ClientController(JwtUtils jwtUtils, ClientService clientService) {
        this.jwtUtils = jwtUtils;
        this.clientService = clientService;
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Client loginClient) {
        boolean isAuthenticated = clientService.authenticateUser(loginClient);
        Map<String, String> response = new HashMap<>();
        if (isAuthenticated) {
            String token = jwtUtils.generateToken(loginClient.getEmail());
            response.put("token", token);
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Client newClient) {
        Map<String, String> response = new HashMap<>();
        try {
            Client registeredClient = clientService.registerUser(newClient);
            if (registeredClient != null) {
                response.put("message", "User registered successfully!");
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                response.put("message", "User already exists.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
        } catch (Exception e) {
            response.put("message", "Registration failed due to an error.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String jwtToken = token.replace("Bearer ", "");
            if (!jwtUtils.validateToken(jwtToken)) {
                response.put("message", "Invalid or expired token.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            String email = jwtUtils.getEmailFromToken(jwtToken);
            Optional<Client> client = clientService.findByEmail(email);
            if (client.isPresent()) {
                response.put("id", client.get().getUserId());
                response.put("email", client.get().getEmail());
                response.put("firstName", client.get().getFirstName());
                response.put("lastName", client.get().getLastName());
                response.put("createdAt", client.get().getCreatedAt());
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "User not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("message", "Invalid token.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
