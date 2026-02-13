package com.example.bookstore.service;

import com.example.bookstore.dto.AdminDto;
import com.example.bookstore.dto.PickUpPointDto;
import com.example.bookstore.enums.Role;
import com.example.bookstore.model.Admin;
import com.example.bookstore.model.PickUpPoint;
import com.example.bookstore.repository.AdminRepository;
import com.example.bookstore.config.PasswordUtils;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.AuthException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.exception.TooManyAttemptsException;
import com.example.bookstore.repository.PickUpPointRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class AdminAuthService {

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;
    private final AdminRepository adminRepository;
    private final PickUpPointRepository pickUpPointRepository;
    private final Random random = new Random();

    public AdminAuthService(StringRedisTemplate redisTemplate,
                            EmailService emailService,
                            AdminRepository adminRepository, PickUpPointRepository pickUpPointRepository) {
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
        this.adminRepository = adminRepository;
        this.pickUpPointRepository = pickUpPointRepository;
    }

    public void sendTwoFaCode(String username, String passwordFromRequest) {
        checkLoginAttempts(username);
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        if (!PasswordUtils.checkPassword(passwordFromRequest, admin.getPassword())) {
            incrementLoginAttempts(username);
            throw new AuthException("Invalid credentials");
        }

        clearLoginAttempts(username);
        String code = String.format("%06d", random.nextInt(1_000_000));
        String key = "2fa:" + username;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        emailService.sendTwoFaCode(admin.getEmail(), code);
    }

    public void verifyTwoFaCode(String username, String code, HttpSession session) {
        check2FAAttempts(username);
        String key = "2fa:" + username;
        String codeInRedis = redisTemplate.opsForValue().get(key);
        if (codeInRedis == null) {
            increment2FAAttempts(username);
            throw new UnauthorizedException("2FA code expired or invalid");
        }

        if (!codeInRedis.equals(code)) {
            increment2FAAttempts(username);
            throw new UnauthorizedException("Invalid 2FA code");
        }
        redisTemplate.delete(key);
        clear2FAAttempts(username);
        session.setAttribute("ADMIN", username);
    }

    public boolean isAdminLoggedIn(HttpSession session) {
        return session.getAttribute("ADMIN") != null;
    }

    public AdminDto getAdminInfo(String username) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        PickUpPointDto ppDto = null;
        if (admin.getPickUpPointId() != null) {
            PickUpPoint point = pickUpPointRepository.findByPickupPointId(admin.getPickUpPointId()).orElse(null);
            if (point != null) {
                ppDto = new PickUpPointDto(point.getPickupPointId(), point.getName(), point.getAddress(),
                        point.getContactPhone(), point.getWorkingHours(), point.getIsActive());
            }
        }

        return new AdminDto(admin.getUsername(), admin.getFullName(), admin.getRole(), ppDto);
    }


    public void logout(String username, HttpSession session) {
        clearLoginAttempts(username);
        clear2FAAttempts(username);
        redisTemplate.delete("2fa:" + username);
        session.invalidate();
    }


    private void checkLoginAttempts(String username) {
        String key = "login_attempts:" + username;
        String attempts = redisTemplate.opsForValue().get(key);

        if (attempts != null && Integer.parseInt(attempts) >= 5) {
            throw new TooManyAttemptsException("Too many login attempts. Please try again in 5 minutes");
        }
    }

    private void incrementLoginAttempts(String username) {
        String key = "login_attempts:" + username;
        String currentAttempts = redisTemplate.opsForValue().get(key);

        if (currentAttempts == null) {
            redisTemplate.opsForValue().set(key, "1", 5, TimeUnit.MINUTES);
        } else {
            redisTemplate.opsForValue().set(key, String.valueOf(Integer.parseInt(currentAttempts) + 1), 5, TimeUnit.MINUTES);
        }
    }

    private void check2FAAttempts(String username) {
        String key = "2fa_attempts:" + username;
        String attempts = redisTemplate.opsForValue().get(key);

        if (attempts != null && Integer.parseInt(attempts) >= 5) {
            throw new TooManyAttemptsException("Too many 2FA attempts. Please try again in 5 minutes");
        }
    }

    private void increment2FAAttempts(String username) {
        String key = "2fa_attempts:" + username;
        String currentAttempts = redisTemplate.opsForValue().get(key);

        if (currentAttempts == null) {
            redisTemplate.opsForValue().set(key, "1", 5, TimeUnit.MINUTES);
        } else {
            redisTemplate.opsForValue().set(key, String.valueOf(Integer.parseInt(currentAttempts) + 1), 5, TimeUnit.MINUTES);
        }
    }

    private void clear2FAAttempts(String username) {
        String key = "2fa_attempts:" + username;
        redisTemplate.delete(key);
    }

    private void clearLoginAttempts(String username) {
        String key = "login_attempts:" + username;
        redisTemplate.delete(key);
    }

    public void requireAdminRole(HttpSession session) {
        String username = (String) session.getAttribute("ADMIN");
        if (username == null || username.trim().isEmpty()) {
            throw new UnauthorizedException("Session expired. Please login again");
        }

        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Admin account not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Access denied: ADMIN role required");
        }
    }

    public Admin requireStaffAccess(HttpSession session) {
        String username = (String) session.getAttribute("ADMIN");
        if (username == null || username.trim().isEmpty()) {
            throw new UnauthorizedException("Session expired. Please login again");
        }
        Admin staff = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Account not found"));

        if (staff.getRole() != Role.ADMIN && staff.getRole() != Role.WORKER) {
            throw new UnauthorizedException("Access denied: Insufficient permissions");
        }
        return staff;
    }
}