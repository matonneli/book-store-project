package com.example.bookstore.service;

import com.example.bookstore.config.PasswordUtils;
import com.example.bookstore.dto.CreateWorkerRequest;
import com.example.bookstore.dto.PickUpPointDto;
import com.example.bookstore.dto.UpdateWorkerRequest;
import com.example.bookstore.dto.WorkerDto;
import com.example.bookstore.enums.Role;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.model.Admin;
import com.example.bookstore.model.PickUpPoint;
import com.example.bookstore.repository.AdminRepository;
import com.example.bookstore.repository.PickUpPointRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WorkerManagementService {

    private final AdminRepository adminRepository;
    private final PickUpPointRepository pickUpPointRepository;
    private final StringRedisTemplate redisTemplate;

    public WorkerManagementService(AdminRepository adminRepository,
                                   PickUpPointRepository pickUpPointRepository,
                                   StringRedisTemplate redisTemplate) {
        this.adminRepository = adminRepository;
        this.pickUpPointRepository = pickUpPointRepository;
        this.redisTemplate = redisTemplate;
    }

    public WorkerDto createWorker(CreateWorkerRequest request) {
        if (adminRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ValidationException("Username already exists");
        }

        if (request.getPickupPointId() != null) {
            pickUpPointRepository.findByPickupPointId(request.getPickupPointId())
                    .orElseThrow(() -> new NotFoundException("Pickup point not found"));
        }

        Admin worker = new Admin();
        worker.setUsername(request.getUsername());
        worker.setPassword(PasswordUtils.hashPassword(request.getPassword()));
        worker.setFullName(request.getFullName());
        worker.setEmail(request.getEmail());
        worker.setRole(Role.WORKER);
        worker.setPickUpPointId(request.getPickupPointId());

        Admin savedWorker = adminRepository.save(worker);
        return mapToWorkerDto(savedWorker);
    }

    public WorkerDto updateWorker(Integer adminId, UpdateWorkerRequest request) {
        Admin worker = adminRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Worker not found"));

        if (worker.getRole() != Role.WORKER) {
            throw new ValidationException("Can only update workers, not admins");
        }

        if (request.getUsername() != null && !request.getUsername().equals(worker.getUsername())) {
            if (adminRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new ValidationException("Username already exists");
            }
            worker.setUsername(request.getUsername());
        }

        if (request.getFullName() != null) {
            worker.setFullName(request.getFullName());
        }

        if (request.getEmail() != null) {
            worker.setEmail(request.getEmail());
        }

        if (request.getPickupPointId() != null) {
            pickUpPointRepository.findByPickupPointId(request.getPickupPointId())
                    .orElseThrow(() -> new NotFoundException("Pickup point not found"));
            worker.setPickUpPointId(request.getPickupPointId());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            worker.setPassword(PasswordUtils.hashPassword(request.getPassword()));
        }

        Admin updatedWorker = adminRepository.save(worker);
        return mapToWorkerDto(updatedWorker);
    }

    public void deleteWorker(Integer adminId) {
        Admin worker = adminRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Worker not found"));

        if (worker.getRole() != Role.WORKER) {
            throw new ValidationException("Can only delete workers, not admins");
        }

        invalidateWorkerSession(worker.getUsername());

        adminRepository.delete(worker);
    }

    @Transactional(readOnly = true)
    public List<WorkerDto> getAllWorkers() {
        return adminRepository.findByRole(Role.WORKER).stream()
                .map(this::mapToWorkerDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkerDto getWorkerById(Integer adminId) {
        Admin worker = adminRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Worker not found"));

        if (worker.getRole() != Role.WORKER) {
            throw new ValidationException("This is not a worker account");
        }

        return mapToWorkerDto(worker);
    }

    private WorkerDto mapToWorkerDto(Admin worker) {
        PickUpPointDto ppDto = null;
        if (worker.getPickUpPointId() != null) {
            PickUpPoint point = pickUpPointRepository.findByPickupPointId(worker.getPickUpPointId()).orElse(null);
            if (point != null) {
                ppDto = new PickUpPointDto(
                        point.getPickupPointId(),
                        point.getName(),
                        point.getAddress(),
                        point.getContactPhone(),
                        point.getWorkingHours(),
                        point.getIsActive()
                );
            }
        }

        return new WorkerDto(
                worker.getAdminId(),
                worker.getUsername(),
                worker.getFullName(),
                worker.getEmail(),
                worker.getRole(),
                ppDto
        );
    }

    private void invalidateWorkerSession(String username) {
        redisTemplate.delete("login_attempts:" + username);
        redisTemplate.delete("2fa_attempts:" + username);
        redisTemplate.delete("2fa:" + username);
    }
}