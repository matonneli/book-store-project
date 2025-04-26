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
    private final BookService bookService;
    private final ClientService clientService;
    public MainController(BookService bookService, ClientService clientService) {
        this.bookService = bookService;
        this.clientService = clientService;
    }
    @GetMapping("/test")
    @ResponseBody
    public String test(){
        //List<Book> books = bookService.getAllBooks();
        //<Client> users = clientService.getAllClients();
        //System.out.println(books.get(0).getTitle());
        //System.out.println(users.get(0).getUserId());
        String password = "password123";
        String hashedPassword = PasswordUtils.hashPassword(password);
        if (PasswordUtils.checkPassword(password, hashedPassword)) {
            System.out.println("password ok");
            System.out.println(hashedPassword);
        } else {
            System.out.println("not ok");
        }
        SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String base64Key = Base64.getEncoder().encodeToString(secretKey.getEncoded());
        System.out.println("Сгенерированный ключ для HS256:");
        System.out.println(base64Key);
        return "Hello world";
    }
}
