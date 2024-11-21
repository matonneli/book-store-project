package com.example.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookstore.model.User;
public interface UserRepository extends JpaRepository<User, Integer>{

}
