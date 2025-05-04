// src/main/java/com/contactmanager/controller/AuthController.java
package com.contactmanager.controller;

import com.contactmanager.model.User;
import com.contactmanager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        // For login, you need to verify the credentials
        User authenticatedUser = userService.authenticateUser(user.getEmail(), user.getPassword());
        if (authenticatedUser != null) {
            // Don't return the password in the response
            authenticatedUser.setPassword(null);
            return ResponseEntity.ok(authenticatedUser);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            // Don't return the password
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @PutMapping("/user/{id}/update")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User updatedUser) {
        User savedUser = userService.updateUserProfile(id, updatedUser);

        if (savedUser != null) {
            savedUser.setPassword(null); // Don't return the password
            return ResponseEntity.ok(savedUser);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @PutMapping("/user/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordDetails) {
        String currentPassword = passwordDetails.get("currentPassword");
        String newPassword = passwordDetails.get("newPassword");

        boolean success = userService.updatePassword(id, currentPassword, newPassword);

        if (success) {
            return ResponseEntity.ok("Password updated successfully");
        } else {
            return ResponseEntity.status(400).body("Failed to update password. Please check your current password and try again.");
        }
    }


}
