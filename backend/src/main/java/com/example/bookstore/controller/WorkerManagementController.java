package com.example.bookstore.controller;

import com.example.bookstore.dto.CreateWorkerRequest;
import com.example.bookstore.dto.UpdateWorkerRequest;
import com.example.bookstore.dto.WorkerDto;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.service.AdminAuthService;
import com.example.bookstore.service.WorkerManagementService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/workers")
public class WorkerManagementController {

    private final WorkerManagementService workerService;
    private final AdminAuthService adminAuthService;

    public WorkerManagementController(WorkerManagementService workerService,
                                      AdminAuthService adminAuthService) {
        this.workerService = workerService;
        this.adminAuthService = adminAuthService;
    }

    @PostMapping
    public ResponseEntity<?> createWorker(@RequestBody CreateWorkerRequest request,
                                          HttpSession session) {
        try {
            adminAuthService.requireAdminRole(session);

            validateCreateRequest(request);

            WorkerDto worker = workerService.createWorker(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(worker);

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create worker"));
        }
    }

    @PutMapping("/{adminId}")
    public ResponseEntity<?> updateWorker(@PathVariable Integer adminId,
                                          @RequestBody UpdateWorkerRequest request,
                                          HttpSession session) {
        try {
            adminAuthService.requireAdminRole(session);

            validateUpdateRequest(request);

            WorkerDto worker = workerService.updateWorker(adminId, request);
            return ResponseEntity.ok(worker);

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update worker"));
        }
    }

    @DeleteMapping("/{adminId}")
    public ResponseEntity<?> deleteWorker(@PathVariable Integer adminId,
                                          HttpSession session) {
        try {
            adminAuthService.requireAdminRole(session);

            workerService.deleteWorker(adminId);
            return ResponseEntity.ok(Map.of("message", "Worker deleted successfully"));

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete worker"));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllWorkers(HttpSession session) {
        try {
            adminAuthService.requireAdminRole(session);

            List<WorkerDto> workers = workerService.getAllWorkers();
            return ResponseEntity.ok(workers);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve workers"));
        }
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<?> getWorkerById(@PathVariable Integer adminId,
                                           HttpSession session) {
        try {
            adminAuthService.requireAdminRole(session);

            WorkerDto worker = workerService.getWorkerById(adminId);
            return ResponseEntity.ok(worker);

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve worker"));
        }
    }

    private void validateCreateRequest(CreateWorkerRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new ValidationException("Username cannot be empty");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new ValidationException("Password cannot be empty");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new ValidationException("Full name cannot be empty");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email cannot be empty");
        }

        if (!request.getUsername().matches("^[a-z]+$")) {
            throw new ValidationException("Username can only contain lowercase letters");
        }

        if (request.getUsername().length() < 3 || request.getUsername().length() > 50) {
            throw new ValidationException("Username must be between 3 and 50 characters");
        }

        if (request.getPassword().length() < 6) {
            throw new ValidationException("Password must be at least 6 characters");
        }

        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ValidationException("Invalid email format");
        }
    }

    private void validateUpdateRequest(UpdateWorkerRequest request) {
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            if (!request.getUsername().matches("^[a-z]+$")) {
                throw new ValidationException("Username can only contain lowercase letters");
            }
            if (request.getUsername().length() < 3 || request.getUsername().length() > 50) {
                throw new ValidationException("Username must be between 3 and 50 characters");
            }
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                throw new ValidationException("Invalid email format");
            }
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getPassword().length() < 6) {
                throw new ValidationException("Password must be at least 6 characters");
            }
        }

        if (request.getFullName() != null && request.getFullName().trim().isEmpty()) {
            throw new ValidationException("Full name cannot be empty");
        }
    }
}