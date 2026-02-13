package com.example.bookstore.controller;

import com.example.bookstore.dto.PickUpPointDto;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.service.PickUpPointService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pickup-points")
public class PickUpPointController {

    private final PickUpPointService service;

    public PickUpPointController(PickUpPointService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Object> getAllPickUpPoints() {
        try {
            List<PickUpPointDto> points = service.getAllPickUpPoints();
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve pickup points"));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<Object> getActivePickUpPoints() {
        try {
            List<PickUpPointDto> points = service.getActivePickUpPoints();
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve active pickup points"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getPickUpPoint(@PathVariable Integer id) {
        try {
            validateId(id);
            PickUpPointDto point = service.getPickUpPointById(id);
            return ResponseEntity.ok(point);
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve pickup point"));
        }
    }

    private void validateId(Integer id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Pickup point ID must be a positive integer");
        }
    }
}