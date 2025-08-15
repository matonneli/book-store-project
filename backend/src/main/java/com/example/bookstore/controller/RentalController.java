package com.example.bookstore.controller;

import com.example.bookstore.dto.RentalItemDto;
import com.example.bookstore.service.RentalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping("/my-rentals")
    public ResponseEntity<Page<RentalItemDto>> getMyRentals(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RentalItemDto> rentals = rentalService.getUserRentals(token, pageable);
        return ResponseEntity.ok(rentals);
    }
}