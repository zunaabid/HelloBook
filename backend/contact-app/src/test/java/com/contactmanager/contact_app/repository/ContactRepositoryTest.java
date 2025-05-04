package com.contactmanager.contact_app.repository;


import com.contactmanager.model.Contact;
import com.contactmanager.repository.ContactRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test") // Use a test profile to avoid affecting your dev database
public class ContactRepositoryTest {

    @Autowired
    private ContactRepository contactRepository;

    @Test
    void findByUserId_ShouldReturnOnlyUserContacts() {
        // Arrange
        Long userId1 = 1L;
        Long userId2 = 2L;

        Contact contact1 = new Contact();
        contact1.setFirstName("User1");
        contact1.setLastName("Contact1");
        contact1.setUserId(userId1);

        Contact contact2 = new Contact();
        contact2.setFirstName("User1");
        contact2.setLastName("Contact2");
        contact2.setUserId(userId1);

        Contact contact3 = new Contact();
        contact3.setFirstName("User2");
        contact3.setLastName("Contact");
        contact3.setUserId(userId2);

        contactRepository.save(contact1);
        contactRepository.save(contact2);
        contactRepository.save(contact3);

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<Contact> user1Contacts = contactRepository.findByUserId(userId1, pageable);
        Page<Contact> user2Contacts = contactRepository.findByUserId(userId2, pageable);

        // Assert
        assertEquals(2, user1Contacts.getTotalElements());
        assertEquals(1, user2Contacts.getTotalElements());
    }

    @Test
    void searchUserContacts_ShouldReturnMatchingUserContacts() {
        // Arrange
        Long userId = 1L;

        Contact contact1 = new Contact();
        contact1.setFirstName("John");
        contact1.setLastName("Doe");
        contact1.setUserId(userId);

        Contact contact2 = new Contact();
        contact2.setFirstName("Jane");
        contact2.setLastName("Doe");
        contact2.setUserId(userId);

        Contact contact3 = new Contact();
        contact3.setFirstName("John");
        contact3.setLastName("Smith");
        contact3.setUserId(2L); // Different user

        contactRepository.save(contact1);
        contactRepository.save(contact2);
        contactRepository.save(contact3);

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<Contact> searchResults1 = contactRepository.searchUserContacts(userId, "John", pageable);
        Page<Contact> searchResults2 = contactRepository.searchUserContacts(userId, "Doe", pageable);

        // Assert
        assertEquals(1, searchResults1.getTotalElements());
        assertEquals(2, searchResults2.getTotalElements());
    }
}
