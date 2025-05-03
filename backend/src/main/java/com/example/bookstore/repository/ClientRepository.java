package com.example.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.bookstore.model.Client;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Integer>{
    Optional<Client> findByEmail(String email);
    boolean existsByEmail(String email);
}
