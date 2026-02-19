package com.example.bookstore.repository;

import com.example.bookstore.enums.Role;
import com.example.bookstore.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Optional<Admin> findByUsername(String username);
    List<Admin> findByRole(Role role);
}