package com.example.bookstore.service;

import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.model.Client;
import com.example.bookstore.repository.ClientRepository;
import com.example.bookstore.security.JwtUtils;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final JwtUtils jwtUtils;
    private final ClientRepository clientRepository;
    private final Set<String> invalidatedTokens = new HashSet<>();

    public AuthService(JwtUtils jwtUtils, ClientRepository clientRepository) {
        this.jwtUtils = jwtUtils;
        this.clientRepository = clientRepository;
    }

    public Client getClientFromToken(String token) {
        String jwtToken = extractToken(token);

        if (!validateToken(jwtToken)) {
            throw new UnauthorizedException("Invalid or expired token.");
        }

        String email = jwtUtils.getEmailFromToken(jwtToken);

        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    public boolean validateToken(String jwtToken) {
        return jwtUtils.validateToken(jwtToken) && !isTokenInvalidated(jwtToken);
    }

    public boolean isTokenInvalidated(String jwtToken) {
        return invalidatedTokens.contains(jwtToken);
    }

    public void invalidateToken(String jwtToken) {
        invalidatedTokens.add(jwtToken);
    }

    public String extractToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid Authorization header.");
        }
        return token.substring(7);
    }
}
