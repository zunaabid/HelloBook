package com.contactmanager.service;

import com.contactmanager.model.Contact;
import com.contactmanager.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    // Get contacts for a specific user with pagination
    public Page<Contact> getUserContacts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return contactRepository.findByUserId(userId, pageable);
    }

    // Get a single contact (with user verification)
    public Contact getContactProfile(Long id, Long userId) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found with id: " + id));

        // Check if contact belongs to user
        if (!contact.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to access this contact");
        }

        return contact;
    }

    // Search contacts for a specific user with pagination
    public Page<Contact> searchUserContacts(Long userId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return contactRepository.searchUserContacts(userId, searchTerm, pageable);
    }

    // Create a new contact for a user
    public Contact createContact(Contact contact, Long userId) {
        contact.setUserId(userId);
        return contactRepository.save(contact);
    }

    // Update an existing contact (with user verification)
    public Contact updateContact(Long id, Contact contactDetails, Long userId) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        // Check if contact belongs to user
        if (!contact.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this contact");
        }

        contact.setFirstName(contactDetails.getFirstName());
        contact.setLastName(contactDetails.getLastName());
        contact.setEmail(contactDetails.getEmail());
        contact.setPhone(contactDetails.getPhone());
        contact.setTitle(contactDetails.getTitle());

        return contactRepository.save(contact);
    }

    // Delete a contact by ID (with user verification)
    public boolean deleteContact(Long id, Long userId) {
        Contact contact = contactRepository.findById(id).orElse(null);
        if (contact != null) {
            // Check if contact belongs to user
            if (!contact.getUserId().equals(userId)) {
                throw new RuntimeException("Not authorized to delete this contact");
            }

            contactRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}