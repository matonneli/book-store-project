package com.example.bookstore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MainController {
    @GetMapping("/test")
    @ResponseBody
    public String test(){
        System.out.println("Hello world!");
        return "Hello, World!";
    }
}
