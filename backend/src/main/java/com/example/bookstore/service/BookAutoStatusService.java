package com.example.bookstore.service;

import com.example.bookstore.model.Book;
import com.example.bookstore.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookAutoStatusService {

    private static final Logger log = LoggerFactory.getLogger(BookAutoStatusService.class);

    private static final String STATUS_NOT_AVAILABLE = "NOT_AVAILABLE";
    private static final String STATUS_AVAILABLE = "AVAILABLE";

    private final BookRepository bookRepository;

    public BookAutoStatusService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void updateBookAvailability() {
        log.info("Starting scheduled task: updateBookAvailability");

        List<Book> allBooks = bookRepository.findAll();

        int markedUnavailable = 0;
        int markedAvailable = 0;

        for (Book book : allBooks) {
            boolean outOfStock = book.getStockQuantity() != null && book.getStockQuantity() == 0;

            if (outOfStock && !STATUS_NOT_AVAILABLE.equals(book.getStatus())) {
                book.setStatus(STATUS_NOT_AVAILABLE);
                markedUnavailable++;
                log.debug("Book {} '{}' marked as NOT_AVAILABLE (stock: 0)", book.getBookId(), book.getTitle());

            } else if (!outOfStock && STATUS_NOT_AVAILABLE.equals(book.getStatus())) {
                book.setStatus(STATUS_AVAILABLE);
                markedAvailable++;
                log.debug("Book {} '{}' marked as AVAILABLE (stock: {})", book.getBookId(), book.getTitle(), book.getStockQuantity());
            }
        }

        bookRepository.saveAll(allBooks);

        log.info("Scheduled task completed: {} books → NOT_AVAILABLE, {} books → AVAILABLE",
                markedUnavailable, markedAvailable);
    }
}