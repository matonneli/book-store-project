package com.example.bookstore.controller;

import com.example.bookstore.dto.CartDto;
import com.example.bookstore.model.CartItem;
import com.example.bookstore.service.CartService;
import com.example.bookstore.dto.AddItemRequest;
import com.example.bookstore.enums.ItemType;
import com.example.bookstore.exception.CartException;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItem(@RequestHeader("Authorization") String token,
                                     @RequestBody AddItemRequest request) {
        try {
            CartItem item = cartService.addItem(token, request.getBookId(), request.getType(), request.getRentalDays());
            return ResponseEntity.ok(item);
        } catch (CartException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeItem(@RequestHeader("Authorization") String token,
                                        @PathVariable Integer cartItemId) {
        try {
            cartService.removeItem(token, cartItemId);
            return ResponseEntity.ok(Map.of("message", "Item removed successfully"));
        } catch (CartException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader("Authorization") String token) {
        try {
            cartService.clearCart(token);
            return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (CartException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }


    @GetMapping("/count")
    public ResponseEntity<?> getCount(@RequestHeader("Authorization") String token) {
        try {
            Long count = cartService.countItems(token);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }

    @GetMapping("/items")
    public ResponseEntity<?> getAllItems(@RequestHeader("Authorization") String token) {
        try {
            List<CartItem> items = cartService.getAllItems(token);
            return ResponseEntity.ok(items);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }

    @GetMapping("/contents")
    public ResponseEntity<?> getCartContents(@RequestHeader("Authorization") String token) {
        try {
            CartDto cartContents = cartService.getCartContents(token);
            return ResponseEntity.ok(cartContents);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkBookAvailability(@RequestHeader("Authorization") String token,
                                                   @RequestParam Integer bookId,
                                                   @RequestParam String type) {
        try {
            boolean available = cartService.isBookAvailable(token, bookId);
            return ResponseEntity.ok(Map.of("available", available));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }
}