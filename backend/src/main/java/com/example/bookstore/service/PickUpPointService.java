package com.example.bookstore.service;

import com.example.bookstore.dto.PickUpPointDto;
import com.example.bookstore.exception.NotFoundException; // ИЗМЕНЕНО: добавлен импорт
import com.example.bookstore.model.PickUpPoint;
import com.example.bookstore.repository.PickUpPointRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PickUpPointService {

    private final PickUpPointRepository repository;

    public PickUpPointService(PickUpPointRepository repository) {
        this.repository = repository;
    }

    public List<PickUpPointDto> getAllPickUpPoints() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PickUpPointDto> getById(Integer pickUpPointId) {
        return repository.findById(pickUpPointId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PickUpPointDto> getActivePickUpPoints() {
        return repository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PickUpPointDto mapToDto(PickUpPoint point) {
        return new PickUpPointDto(
                point.getPickupPointId(),
                point.getName(),
                point.getAddress(),
                point.getContactPhone(),
                point.getWorkingHours(),
                point.getIsActive()
        );
    }

    public PickUpPointDto getPickUpPointById(Integer id) {
        return repository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new NotFoundException("PickUpPoint not found with ID: " + id));
    }
}