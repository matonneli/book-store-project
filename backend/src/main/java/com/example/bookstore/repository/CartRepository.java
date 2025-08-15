package com.example.bookstore.repository;

import com.example.bookstore.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUserId(Integer userId);
    void deleteByUserId(Integer userId);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.userId = :userId")
    void deleteCartByUserIdCascade(@Param("userId") Integer userId);
}

