package com.example.bookstore.repository;

import com.example.bookstore.model.CartItem;
import com.example.bookstore.enums.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByCartId(Integer cartId);
    List<CartItem> findByCartIdAndBookId(Integer cartId, Integer bookId);
    long countByCartIdAndBookId(Integer cartId, Integer bookId);
    void deleteByCartId(Integer cartId);
    long countByCartId(Integer cartId);
}