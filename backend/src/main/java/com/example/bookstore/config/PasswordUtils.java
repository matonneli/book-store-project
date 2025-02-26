package com.example.bookstore.config;

import org.springframework.context.annotation.Configuration;
import org.mindrot.jbcrypt.BCrypt;

@Configuration
public class PasswordUtils {
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
    public static boolean checkPassword(String password, String storedHash) {
        return BCrypt.checkpw(password, storedHash);
    }
}
