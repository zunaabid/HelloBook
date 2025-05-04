package com.contactmanager.controller;

import com.contactmanager.model.Contact;
import com.contactmanager.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users/{userId}/contacts")
public class ContactController {

    private static final Logger logger = LoggerFactory.getLogger(ContactController.class);

    @Autowired
    private ContactService contactService;

    @GetMapping
    public Page<Contact> getUserContacts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Fetching contacts for user {} - Page: {}, Size: {}", userId, page, size);
        return contactService.getUserContacts(userId, page, size);
    }

    @GetMapping("/search")
    public Page<Contact> searchUserContacts(
            @PathVariable Long userId,
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Searching contacts for user {} with term: '{}' - Page: {}, Size: {}",
                userId, searchTerm, page, size);
        return contactService.searchUserContacts(userId, searchTerm, page, size);
    }

    @PostMapping
    public Contact createContact(
            @PathVariable Long userId,
            @RequestBody Contact contact) {
        logger.info("Creating new contact for user {}: {}", userId, contact);
        return contactService.createContact(contact, userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> updateContact(
            @PathVariable Long userId,
            @PathVariable Long id,
            @RequestBody Contact contactDetails) {
        logger.info("Updating contact with ID: {} for user {}", id, userId);
        try {
            Contact updatedContact = contactService.updateContact(id, contactDetails, userId);
            return ResponseEntity.ok(updatedContact);
        } catch (RuntimeException e) {
            logger.error("Error updating contact: {}", e.getMessage());
            if (e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            @PathVariable Long userId,
            @PathVariable Long id) {
        logger.warn("Deleting contact with ID: {} for user {}", id, userId);
        try {
            boolean deleted = contactService.deleteContact(id, userId);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (RuntimeException e) {
            logger.error("Error deleting contact: {}", e.getMessage());
            if (e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getContactProfile(
            @PathVariable Long userId,
            @PathVariable Long id) {
        logger.info("Fetching contact profile with ID: {} for user {}", id, userId);
        try {
            Contact contact = contactService.getContactProfile(id, userId);
            return ResponseEntity.ok(contact);
        } catch (RuntimeException e) {
            logger.error("Error fetching contact: {}", e.getMessage());
            if (e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        }
    }
}