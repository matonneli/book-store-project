package com.example.bookstore.service;

import com.example.bookstore.dto.CartDto;
import com.example.bookstore.dto.CartItemDto;
import com.example.bookstore.enums.ItemType;
import com.example.bookstore.enums.OrderStatus;
import com.example.bookstore.exception.OrderException;
import com.example.bookstore.model.Client;
import com.example.bookstore.model.Orders;
import com.example.bookstore.repository.BookRepository;
import com.example.bookstore.repository.OrderItemRepository;
import com.example.bookstore.repository.OrderRepository;
import com.example.bookstore.repository.PickUpPointRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartService cartService;
    @Mock
    private AuthService authService;
    @Mock
    private BookRepository bookRepository;


    @InjectMocks
    private OrderService orderService;

    @Test
    void calculateTotalPrice_sumsItemPricesCorrectly() throws Exception {
        var method = OrderService.class.getDeclaredMethod("calculateTotalPrice", List.class);
        method.setAccessible(true);

        CartItemDto item1 = new CartItemDto();
        item1.setPrice(new BigDecimal("19.99"));

        CartItemDto item2 = new CartItemDto();
        item2.setPrice(new BigDecimal("9.99"));

        CartItemDto item3 = new CartItemDto();
        item3.setPrice(new BigDecimal("5.00"));

        List<CartItemDto> items = List.of(item1, item2, item3);

        BigDecimal result = (BigDecimal) method.invoke(orderService, items);

        assertThat(result).isEqualByComparingTo(new BigDecimal("34.98"));
    }



    @Test
    void validateCartNotEmpty_emptyCart_throwsOrderException() throws Exception {
        var method = OrderService.class.getDeclaredMethod("validateCartNotEmpty", List.class);
        method.setAccessible(true);

        assertThatThrownBy(() -> {
            try {
                method.invoke(orderService, List.of());
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            }
        }).isInstanceOf(OrderException.class)
                .hasMessageContaining("cart is empty");
    }


    @Test
    void validateOrderCanBeCancelled_deliveredOrder_throwsOrderException() throws Exception {
        var method = OrderService.class.getDeclaredMethod("validateOrderCanBeCancelled", Orders.class);
        method.setAccessible(true);

        Orders order = new Orders();
        order.setStatus(OrderStatus.DELIVERED);

        assertThatThrownBy(() -> {
            try {
                method.invoke(orderService, order);
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            }
        }).isInstanceOf(OrderException.class)
                .hasMessageContaining("Cannot cancel delivered order");
    }

    @Test
    void createOrderFromCart_emptyCart_throwsOrderException() {
        String token = "valid-token";
        Integer pickupPointId = 1;
        Client mockClient = new Client();
        mockClient.setUserId(100);
        CartDto emptyCart = new CartDto(List.of());
        when(authService.getClientFromToken(token)).thenReturn(mockClient);
        when(cartService.getCartContents(token)).thenReturn(emptyCart);
        assertThatThrownBy(() -> orderService.createOrderFromCart(token, pickupPointId))
                .isInstanceOf(OrderException.class)
                .hasMessageContaining("cart is empty");
        verify(orderRepository, never()).save(any());
        verify(bookRepository, never()).save(any());
    }
}