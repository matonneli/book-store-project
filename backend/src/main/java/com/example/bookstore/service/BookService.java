package com.example.bookstore.service;

import com.example.bookstore.dto.BookDto;
import com.example.bookstore.dto.BookDetailDto;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final CategoryRepository categoryRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookCategoryRepository bookCategoryRepository;

    @Autowired
    public BookService(BookRepository bookRepository,
                       AuthorRepository authorRepository,
                       GenreRepository genreRepository,
                       CategoryRepository categoryRepository,
                       BookGenreRepository bookGenreRepository,
                       BookCategoryRepository bookCategoryRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.genreRepository = genreRepository;
        this.categoryRepository = categoryRepository;
        this.bookGenreRepository = bookGenreRepository;
        this.bookCategoryRepository = bookCategoryRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBooks(List<Integer> genreIds, List<Integer> categoryIds,
                                        String title, String sortOrder, int page, int size) {
        genreIds = (genreIds == null || genreIds.isEmpty()) ? null : genreIds;
        categoryIds = (categoryIds == null || categoryIds.isEmpty()) ? null : categoryIds;
        String pattern = null;
        if (title != null && !title.isBlank()) {
            pattern = "%" + title.trim() + "%";
        }
        boolean desc = "desc".equalsIgnoreCase(sortOrder);

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = desc
                ? bookRepository.findFilteredSortedDesc(genreIds, categoryIds, pattern, pageable)
                : bookRepository.findFilteredSortedAsc(genreIds, categoryIds, pattern, pageable);

        List<BookDto> bookDtos = bookPage.getContent().stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("books", bookDtos);
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("totalElements", bookPage.getTotalElements());
        response.put("hasNext", bookPage.hasNext());
        response.put("hasPrevious", bookPage.hasPrevious());

        return response;
    }

    @Transactional(readOnly = true)
    public BookDto getBookByIdForCatalog(Integer id) {
        Optional<Book> bookOptional = bookRepository.findById(id);
        return bookOptional.map(this::convertToBookDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDiscountedBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findDiscountedBooks(pageable);

        List<BookDto> bookDtos = bookPage.getContent().stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("books", bookDtos);
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("totalElements", bookPage.getTotalElements());
        response.put("hasNext", bookPage.hasNext());
        response.put("hasPrevious", bookPage.hasPrevious());

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNewBooks(int page, int size) {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findNewBooks(oneMonthAgo, pageable);

        List<BookDto> bookDtos = bookPage.getContent().stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("books", bookDtos);
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("totalElements", bookPage.getTotalElements());
        response.put("hasNext", bookPage.hasNext());
        response.put("hasPrevious", bookPage.hasPrevious());

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBestsellers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findBestsellers(pageable);

        List<BookDto> bookDtos = bookPage.getContent().stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("books", bookDtos);
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("totalElements", bookPage.getTotalElements());
        response.put("hasNext", bookPage.hasNext());
        response.put("hasPrevious", bookPage.hasPrevious());

        return response;
    }

    private BookDto convertToBookDto(Book book) {
        BookDto dto = new BookDto();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        Optional<Author> authorOptional = authorRepository.findById(book.getAuthorId());
        authorOptional.ifPresent(author -> dto.setAuthorName(author.getFullName()));
        dto.setDescription(book.getDescription());
        dto.setPublicationDate(book.getPublicationDate());
        dto.setPurchasePrice(book.getPurchasePrice());
        dto.setRentalPrice(book.getRentalPrice());
        dto.setStockQuantity(book.getStockQuantity());

        List<String> imageUrls = book.getImages().stream()
                .map(BookImage::getImageUrl)
                .collect(Collectors.toList());
        dto.setImageUrls(imageUrls);

        List<BookGenre> bookGenres = bookGenreRepository.findByBookId(book.getBookId());
        List<String> genres = bookGenres.stream()
                .map(bookGenre -> {
                    Optional<Genre> genreOptional = genreRepository.findById(bookGenre.getGenreId());
                    return genreOptional.map(Genre::getName).orElse(null);
                })
                .filter(text -> text != null)
                .collect(Collectors.toList());
        dto.setGenres(genres);

        List<BookCategory> bookCategories = bookCategoryRepository.findByBookId(book.getBookId());
        List<String> categories = bookCategories.stream()
                .map(bookCategory -> {
                    Optional<Category> categoryOptional = categoryRepository.findById(bookCategory.getCategoryId());
                    return categoryOptional.map(Category::getName).orElse(null);
                })
                .filter(text -> text != null)
                .collect(Collectors.toList());
        dto.setCategories(categories);
        dto.setDiscountPercent(book.getDiscountPercent());
        return dto;
    }

    @Transactional(readOnly = true)
    public BookDetailDto getBookDetailById(Integer id) {
        BookDto basicBook = getBookByIdForCatalog(id);
        if (basicBook == null) {
            return null;
        }
        BookDetailDto detailDto = new BookDetailDto();
        BeanUtils.copyProperties(basicBook, detailDto);
        detailDto.setAverageRating(bookRepository.getAverageRatingByBookId(id));
        detailDto.setTotalReviews(bookRepository.getTotalReviewsByBookId(id));
        return detailDto;
    }
}