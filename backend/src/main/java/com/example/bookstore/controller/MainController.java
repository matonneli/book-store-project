package com.example.bookstore.controller;

import com.example.bookstore.config.PasswordUtils;
import com.example.bookstore.model.Book;
import com.example.bookstore.model.Client;
import com.example.bookstore.service.ClientService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.example.bookstore.service.BookService;

import java.util.List;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import javax.crypto.SecretKey;
import java.util.Base64;
@Controller
public class MainController {

}
