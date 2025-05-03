package com.example.bookstore.service;

import com.example.bookstore.dto.GenreDto;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class GenreService {

    @Autowired
    private GenreRepository genreRepository;

    public List<GenreDto> getAllGenres() {

        List<Genre> genres = genreRepository.findAll();
        return genres.stream()
                .map(genre -> {
                    return new GenreDto(genre.getGenreId(), genre.getName());
                })
                .collect(Collectors.toList());
    }
}

