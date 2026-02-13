package com.example.bookstore.repository;

import com.example.bookstore.model.Client;
import com.example.bookstore.model.PickUpPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PickUpPointRepository extends JpaRepository<PickUpPoint, Integer> {
    List<PickUpPoint> findByIsActiveTrue();
    Optional<PickUpPoint> findByPickupPointId(Integer pickupPointId);
}
