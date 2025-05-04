package com.contactmanager.contact_app.service;


import com.contactmanager.model.Contact;
import com.contactmanager.repository.ContactRepository;
import com.contactmanager.service.ContactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private Contact testContact;
    private final Long userId = 1L;
    private final Long contactId = 1L;

    @BeforeEach
    void setUp() {
        testContact = new Contact();
        testContact.setId(contactId);
        testContact.setFirstName("John");
        testContact.setLastName("Doe");
        testContact.setEmail("john.doe@example.com");
        testContact.setPhone("+1234567890");
        testContact.setTitle("Manager");
        testContact.setUserId(userId);
    }

    @Test
    void getUserContacts_ShouldReturnPageOfContacts() {
        // Arrange
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);
        List<Contact> contacts = Arrays.asList(testContact);
        Page<Contact> contactPage = new PageImpl<>(contacts, pageable, contacts.size());

        when(contactRepository.findByUserId(eq(userId), any(Pageable.class))).thenReturn(contactPage);

        // Act
        Page<Contact> result = contactService.getUserContacts(userId, page, size);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testContact.getId(), result.getContent().get(0).getId());
        verify(contactRepository).findByUserId(eq(userId), any(Pageable.class));
    }

    @Test
    void getContactProfile_WhenContactExists_ShouldReturnContact() {
        // Arrange
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));

        // Act
        Contact result = contactService.getContactProfile(contactId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(testContact.getId(), result.getId());
        assertEquals(testContact.getFirstName(), result.getFirstName());
    }

    @Test
    void getContactProfile_WhenContactNotFound_ShouldThrowException() {
        // Arrange
        when(contactRepository.findById(contactId)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            contactService.getContactProfile(contactId, userId);
        });

        assertTrue(exception.getMessage().contains("Contact not found"));
    }

    @Test
    void getContactProfile_WhenUserUnauthorized_ShouldThrowException() {
        // Arrange
        Long unauthorizedUserId = 2L;
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            contactService.getContactProfile(contactId, unauthorizedUserId);
        });

        assertTrue(exception.getMessage().contains("Not authorized"));
    }

    @Test
    void searchUserContacts_ShouldReturnMatchingContacts() {
        // Arrange
        String searchTerm = "John";
        int page = 0;
        int size = 10;
        Pageable pageable = PageRequest.of(page, size);
        List<Contact> contacts = Arrays.asList(testContact);
        Page<Contact> contactPage = new PageImpl<>(contacts, pageable, contacts.size());

        when(contactRepository.searchUserContacts(eq(userId), eq(searchTerm), any(Pageable.class)))
                .thenReturn(contactPage);

        // Act
        Page<Contact> result = contactService.searchUserContacts(userId, searchTerm, page, size);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testContact.getId(), result.getContent().get(0).getId());
    }

    @Test
    void createContact_ShouldSetUserIdAndSaveContact() {
        // Arrange
        Contact newContact = new Contact();
        newContact.setFirstName("Jane");
        newContact.setLastName("Smith");

        when(contactRepository.save(any(Contact.class))).thenAnswer(invocation -> {
            Contact savedContact = invocation.getArgument(0);
            savedContact.setId(2L); // Simulate DB assigning ID
            return savedContact;
        });

        // Act
        Contact result = contactService.createContact(newContact, userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals("Jane", result.getFirstName());
        verify(contactRepository).save(newContact);
    }

    @Test
    void updateContact_WhenAuthorized_ShouldUpdateAndReturnContact() {
        // Arrange
        Contact updateDetails = new Contact();
        updateDetails.setFirstName("Updated");
        updateDetails.setLastName("Name");
        updateDetails.setEmail("updated@example.com");
        updateDetails.setPhone("+9876543210");
        updateDetails.setTitle("Director");

        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        // Act
        Contact result = contactService.updateContact(contactId, updateDetails, userId);

        // Assert
        assertNotNull(result);
        assertEquals("Updated", result.getFirstName());
        assertEquals("Name", result.getLastName());
        assertEquals("updated@example.com", result.getEmail());
        assertEquals("+9876543210", result.getPhone());
        assertEquals("Director", result.getTitle());
        verify(contactRepository).save(testContact);
    }

    @Test
    void updateContact_WhenUnauthorized_ShouldThrowException() {
        // Arrange
        Long unauthorizedUserId = 2L;
        Contact updateDetails = new Contact();

        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            contactService.updateContact(contactId, updateDetails, unauthorizedUserId);
        });

        assertTrue(exception.getMessage().contains("Not authorized"));
        verify(contactRepository, never()).save(any(Contact.class));
    }

    @Test
    void deleteContact_WhenAuthorized_ShouldDeleteAndReturnTrue() {
        // Arrange
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));
        doNothing().when(contactRepository).deleteById(contactId);

        // Act
        boolean result = contactService.deleteContact(contactId, userId);

        // Assert
        assertTrue(result);
        verify(contactRepository).deleteById(contactId);
    }

    @Test
    void deleteContact_WhenUnauthorized_ShouldThrowException() {
        // Arrange
        Long unauthorizedUserId = 2L;
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(testContact));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            contactService.deleteContact(contactId, unauthorizedUserId);
        });

        assertTrue(exception.getMessage().contains("Not authorized"));
        verify(contactRepository, never()).deleteById(any());
    }
}
