package com.example.bookstore.service;

import com.example.bookstore.dto.CartDto;
import com.example.bookstore.dto.CartItemDto;
import com.example.bookstore.model.Cart;
import com.example.bookstore.model.CartItem;
import com.example.bookstore.model.Book;
import com.example.bookstore.enums.ItemType;
import com.example.bookstore.model.Client;
import com.example.bookstore.model.Author;
import com.example.bookstore.model.BookImage;
import com.example.bookstore.repository.AuthorRepository;
import com.example.bookstore.repository.CartRepository;
import com.example.bookstore.repository.CartItemRepository;
import com.example.bookstore.repository.BookRepository;
import com.example.bookstore.exception.CartException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private static final int MAX_CART_ITEMS = 4;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final AuthService authService;
    private final AuthorRepository authorRepository;


    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       BookRepository bookRepository,
                       AuthService authService, AuthorRepository authorRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.authService = authService;
        this.authorRepository = authorRepository;
    }

    public Cart getOrCreateCart(Integer userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUserId(userId);
                    cart.setCreatedAt(LocalDateTime.now());
                    cart.setUpdatedAt(LocalDateTime.now());
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public CartItem addItem(String token, Integer bookId, ItemType type, Integer rentalDays) {
        Client client = authService.getClientFromToken(token);
        Cart cart = getOrCreateCart(client.getUserId());
        long currentItemsCount = cartItemRepository.countByCartId(cart.getCartId());
        if (currentItemsCount >= MAX_CART_ITEMS) {
            throw new CartException("Cart is full. Maximum " + MAX_CART_ITEMS + " items allowed");
        }
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new CartException("Book not found"));
        validateBookAvailability(cart.getCartId(), bookId, book);
        CartItem item = new CartItem();
        item.setCartId(cart.getCartId());
        item.setBookId(bookId);
        item.setType(type);
        item.setRentalDays(rentalDays);
        item.setAddedAt(LocalDateTime.now());

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(String token, Integer cartItemId) {
        Client client = authService.getClientFromToken(token);
        Optional<Cart> optionalCart = cartRepository.findByUserId(client.getUserId());
        if (optionalCart.isEmpty()) return;
        Cart cart = optionalCart.get();
        Optional<CartItem> cartItem = cartItemRepository.findById(cartItemId);
        if (cartItem.isEmpty() || !cartItem.get().getCartId().equals(cart.getCartId())) {
            throw new CartException("Cart item not found");
        }
        cartItemRepository.deleteById(cartItemId);
        long remainingItems = cartItemRepository.countByCartId(cart.getCartId());
        if (remainingItems == 0) {
            cartItemRepository.deleteByCartId(cart.getCartId());
            cartRepository.deleteByUserId(client.getUserId());
        } else {
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        }
    }

    @Transactional
    public void clearCart(String token) {
        Client client = authService.getClientFromToken(token);
        Optional<Cart> optionalCart = cartRepository.findByUserId(client.getUserId());
        if (optionalCart.isEmpty()) {
            throw new CartException("Cart is empty or not found");
        }
        cartRepository.deleteCartByUserIdCascade(client.getUserId());
    }

    public CartDto getCartContents(String token) {
        Client client = authService.getClientFromToken(token);
        Optional<Cart> cartOpt = cartRepository.findByUserId(client.getUserId());
        if (cartOpt.isEmpty()) {
            return new CartDto(new ArrayList<>());
        }

        Cart cart = cartOpt.get();
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getCartId());

        List<CartItemDto> cartItemDTOs = cartItems.stream()
                .map(this::convertToCartItemDTO)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        return new CartDto(cartItemDTOs);
    }

    private CartItemDto convertToCartItemDTO(CartItem cartItem) {
        CartItemDto dto = new CartItemDto();
        dto.setCartItemId(cartItem.getCartItemId());
        dto.setBookId(cartItem.getBookId());
        dto.setType(cartItem.getType());
        dto.setRentalDays(cartItem.getRentalDays());
        dto.setAddedAt(cartItem.getAddedAt());
        Optional<Book> bookOpt = bookRepository.findById(cartItem.getBookId());
        if (bookOpt.isEmpty()) {
            return null;
        }
        Book book = bookOpt.get();
        dto.setTitle(book.getTitle());
        dto.setStockQuantity(book.getStockQuantity());
        if (book.getAuthorId() != null) {
            Optional<Author> authorOpt = authorRepository.findById(book.getAuthorId());
            if (authorOpt.isPresent()) {
                dto.setAuthorName(authorOpt.get().getFullName());
            }
        }
        List<String> imageUrls = book.getImages().stream()
                .map(BookImage::getImageUrl)
                .collect(Collectors.toList());
        dto.setImageUrls(imageUrls);
        calculatePrices(dto, book, cartItem);
        boolean available = isCartItemStillAvailable(cartItem);
        dto.setAvailable(available);
        return dto;
    }

    private void calculatePrices(CartItemDto dto, Book book, CartItem cartItem) {
        BigDecimal discountPercent = book.getDiscountPercent() != null ?
                book.getDiscountPercent() : BigDecimal.ZERO;
        dto.setDiscountPercent(discountPercent);

        BigDecimal originalPrice;
        BigDecimal finalPrice;

        if (cartItem.getType() == ItemType.BUY) {
            originalPrice = BigDecimal.valueOf(book.getPurchasePrice());
            finalPrice = originalPrice.multiply(
                    BigDecimal.ONE.subtract(discountPercent.divide(BigDecimal.valueOf(100)))
            );
        } else {
            BigDecimal dailyRate = BigDecimal.valueOf(book.getRentalPrice());
            BigDecimal days = BigDecimal.valueOf(cartItem.getRentalDays());
            originalPrice = dailyRate.multiply(days);
            finalPrice = originalPrice;
            dto.setDiscountPercent(BigDecimal.ZERO);
        }
        dto.setOriginalPrice(originalPrice);
        dto.setPrice(finalPrice);
    }

    public Long countItems(String token) {
        Client client = authService.getClientFromToken(token);
        Optional<Cart> optionalCart = cartRepository.findByUserId(client.getUserId());
        return optionalCart.map(cart -> cartItemRepository.countByCartId(cart.getCartId())).orElse(0L);
    }

    public List<CartItem> getAllItems(String token) {
        Client client = authService.getClientFromToken(token);
        Optional<Cart> optionalCart = cartRepository.findByUserId(client.getUserId());
        return optionalCart.map(cart -> cartItemRepository.findByCartId(cart.getCartId())).orElse(List.of());
    }

    public boolean isBookAvailable(String token, Integer bookId) {
        try {
            Client client = authService.getClientFromToken(token);
            Cart cart = getOrCreateCart(client.getUserId());
            Book book = bookRepository.findById(bookId).orElse(null);

            if (book == null) return false;

            validateBookAvailability(cart.getCartId(), bookId, book);
            return true;
        } catch (CartException e) {
            return false;
        }
    }

    private boolean isCartItemStillAvailable(CartItem cartItem) {
        Book book = bookRepository.findById(cartItem.getBookId()).get();

        long itemsInCart = cartItemRepository.countByCartIdAndBookId(
                cartItem.getCartId(), cartItem.getBookId());

        return itemsInCart <= book.getStockQuantity();
    }

    private void validateBookAvailability(Integer cartId, Integer bookId, Book book) {
        long itemsInCart = cartItemRepository.countByCartIdAndBookId(cartId, bookId);
        if (itemsInCart >= book.getStockQuantity()) {
            throw new CartException("Not enough books available. Available: " +
                    (book.getStockQuantity() - itemsInCart) + ", total: " + book.getStockQuantity());
        }
    }
}