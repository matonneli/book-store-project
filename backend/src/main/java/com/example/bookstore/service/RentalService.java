package com.example.bookstore.service;

import com.example.bookstore.dto.RentalItemDto;
import com.example.bookstore.enums.ItemType;
import com.example.bookstore.model.Client;
import com.example.bookstore.model.OrderItem;
import com.example.bookstore.repository.OrderItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RentalService {

    private final OrderItemRepository orderItemRepository;
    private final AuthService authService;

    public RentalService(OrderItemRepository orderItemRepository, AuthService authService) {
        this.orderItemRepository = orderItemRepository;
        this.authService = authService;
    }

    public Page<RentalItemDto> getUserRentals(String token, Pageable pageable) {
        Client client = authService.getClientFromToken(token);
        int userId = client.getUserId();

        Page<Object[]> rawItems = orderItemRepository.findUserRentalItems(userId, pageable);
        List<RentalItemDto> rentalItems = new ArrayList<>();

        for (Object[] raw : rawItems.getContent()) {
            OrderItem orderItem = (OrderItem) raw[0];
            String bookTitle = (String) raw[1];
            String authorFullName = (String) raw[2];
            String imageUrl = (String) raw[3];

            RentalItemDto dto = new RentalItemDto();
            dto.setOrderItemId(orderItem.getOrderItemId());
            dto.setOrderId(orderItem.getOrderId());
            dto.setBookId(orderItem.getBookId());
            dto.setBookTitle(bookTitle);
            dto.setAuthorFullName(authorFullName);
            dto.setImageUrl(imageUrl);
            dto.setRentalDays(orderItem.getRentalDays());
            dto.setRentalStartAt(orderItem.getRentalStartAt());
            dto.setRentalEndAt(orderItem.getRentalEndAt());
            dto.setItemStatus(orderItem.getItemStatus());

            rentalItems.add(dto);
        }

        return new PageImpl<>(rentalItems, pageable, rawItems.getTotalElements());
    }
}