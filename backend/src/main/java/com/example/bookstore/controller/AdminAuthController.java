package com.example.bookstore.controller;

import com.example.bookstore.dto.AdminDto;
import com.example.bookstore.service.AdminAuthService;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.AuthException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.exception.TooManyAttemptsException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AdminAuthService authService;

    public AdminAuthController(AdminAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestParam String username,
                                                     @RequestParam String password,
                                                     HttpServletRequest request) {
        try {
            request.getSession(false);
            validateLoginData(username, password);
            authService.sendTwoFaCode(username, password);
            return ResponseEntity.ok(Map.of("message", "2FA code sent to admin email"));
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        } catch (TooManyAttemptsException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed. Please try again"));
        }
    }

    @PostMapping("/2fa-verify")
    public ResponseEntity<Map<String, String>> verify(@RequestParam String username,
                                                      @RequestParam String code,
                                                      HttpSession session) {
        try {
            validateVerifyData(username, code);
            authService.verifyTwoFaCode(username, code, session);
            return ResponseEntity.ok(Map.of("message", "Admin logged in successfully"));
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired 2FA code"));
        } catch (TooManyAttemptsException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Verification failed. Please try again"));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard(HttpSession session) {
        try {
            if (!authService.isAdminLoggedIn(session)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Session expired. Please login again"));
            }
            return ResponseEntity.ok(Map.of("message", "Welcome, admin!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Dashboard access failed"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile(HttpSession session) {
        try {
            if (!authService.isAdminLoggedIn(session)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Session expired. Please login again"));
            }

            String username = (String) session.getAttribute("ADMIN");
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid session. Please login again"));
            }

            AdminDto adminInfo = authService.getAdminInfo(username);
            return ResponseEntity.ok(adminInfo);

        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Admin profile not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve admin profile"));
        }
    }

    @GetMapping("/auth-status")
    public ResponseEntity<Map<String, Boolean>> authStatus(HttpSession session) {
        try {
            boolean loggedIn = authService.isAdminLoggedIn(session);
            return ResponseEntity.ok(Map.of("authenticated", loggedIn));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("authenticated", false));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        try {
            if (!authService.isAdminLoggedIn(session)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Not logged in"));
            }
            String username = (String) session.getAttribute("ADMIN");
            authService.logout(username, session);
            return ResponseEntity.ok(Map.of("message", "Admin logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed"));
        }
    }

    private void validateLoginData(String username, String password) {
        if (username == null || username.trim().isEmpty()) {
            throw new ValidationException("Username cannot be empty");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new ValidationException("Password cannot be empty");
        }
        if (username.trim().length() < 3 || username.trim().length() > 50) {
            throw new ValidationException("Username must be between 3 and 50 characters");
        }
        if (password.length() < 6) {
            throw new ValidationException("Password must be at least 6 characters");
        }
        if (!username.matches("^[a-zA-Z0-9_]+$")) {
            throw new ValidationException("Username can only contain letters, numbers and underscores");
        }
    }

    private void validateVerifyData(String username, String code) {
        if (username == null || username.trim().isEmpty()) {
            throw new ValidationException("Username cannot be empty");
        }
        if (code == null || code.trim().isEmpty()) {
            throw new ValidationException("2FA code cannot be empty");
        }
        if (!code.matches("^\\d{6}$")) {
            throw new ValidationException("2FA code must be exactly 6 digits");
        }
    }

}