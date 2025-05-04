package com.contactmanager.contact_app.controller;

import com.contactmanager.controller.ContactController;
import com.contactmanager.model.Contact;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContactControllerTest {

    @Mock
    private ContactService contactService;

    @InjectMocks
    private ContactController contactController;

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
        List<Contact> contacts = Arrays.asList(testContact);
        Page<Contact> contactPage = new PageImpl<>(contacts);

        when(contactService.getUserContacts(eq(userId), eq(page), eq(size))).thenReturn(contactPage);

        // Act
        Page<Contact> result = contactController.getUserContacts(userId, page, size);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testContact.getId(), result.getContent().get(0).getId());
    }

    @Test
    void searchUserContacts_ShouldReturnMatchingContacts() {
        // Arrange
        String searchTerm = "John";
        int page = 0;
        int size = 10;
        List<Contact> contacts = Arrays.asList(testContact);
        Page<Contact> contactPage = new PageImpl<>(contacts);

        when(contactService.searchUserContacts(eq(userId), eq(searchTerm), eq(page), eq(size)))
                .thenReturn(contactPage);

        // Act
        Page<Contact> result = contactController.searchUserContacts(userId, searchTerm, page, size);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testContact.getId(), result.getContent().get(0).getId());
    }

    @Test
    void createContact_ShouldReturnCreatedContact() {
        // Arrange
        Contact newContact = new Contact();
        newContact.setFirstName("Jane");

        when(contactService.createContact(eq(newContact), eq(userId))).thenReturn(testContact);

        // Act
        Contact result = contactController.createContact(userId, newContact);

        // Assert
        assertNotNull(result);
        assertEquals(testContact.getId(), result.getId());
    }

    @Test
    void updateContact_WhenSuccessful_ShouldReturnUpdatedContact() {
        // Arrange
        Contact updateDetails = new Contact();
        updateDetails.setFirstName("Updated");

        when(contactService.updateContact(eq(contactId), eq(updateDetails), eq(userId)))
                .thenReturn(testContact);

        // Act
        ResponseEntity<Contact> response = contactController.updateContact(userId, contactId, updateDetails);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testContact.getId(), response.getBody().getId());
    }

    @Test
    void updateContact_WhenUnauthorized_ShouldReturnForbidden() {
        // Arrange
        Contact updateDetails = new Contact();

        when(contactService.updateContact(eq(contactId), eq(updateDetails), eq(userId)))
                .thenThrow(new RuntimeException("Not authorized to update this contact"));

        // Act
        ResponseEntity<Contact> response = contactController.updateContact(userId, contactId, updateDetails);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void updateContact_WhenNotFound_ShouldReturnNotFound() {
        // Arrange
        Contact updateDetails = new Contact();

        when(contactService.updateContact(eq(contactId), eq(updateDetails), eq(userId)))
                .thenThrow(new RuntimeException("Contact not found"));

        // Act
        ResponseEntity<Contact> response = contactController.updateContact(userId, contactId, updateDetails);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void deleteContact_WhenSuccessful_ShouldReturnNoContent() {
        // Arrange
        when(contactService.deleteContact(eq(contactId), eq(userId))).thenReturn(true);

        // Act
        ResponseEntity<Void> response = contactController.deleteContact(userId, contactId);

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void deleteContact_WhenUnauthorized_ShouldReturnForbidden() {
        // Arrange
        when(contactService.deleteContact(eq(contactId), eq(userId)))
                .thenThrow(new RuntimeException("Not authorized to delete this contact"));

        // Act
        ResponseEntity<Void> response = contactController.deleteContact(userId, contactId);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void deleteContact_WhenNotFound_ShouldReturnNotFound() {
        // Arrange
        when(contactService.deleteContact(eq(contactId), eq(userId))).thenReturn(false);

        // Act
        ResponseEntity<Void> response = contactController.deleteContact(userId, contactId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getContactProfile_WhenSuccessful_ShouldReturnContact() {
        // Arrange
        when(contactService.getContactProfile(eq(contactId), eq(userId))).thenReturn(testContact);

        // Act
        ResponseEntity<Contact> response = contactController.getContactProfile(userId, contactId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testContact.getId(), response.getBody().getId());
    }

    @Test
    void getContactProfile_WhenUnauthorized_ShouldReturnForbidden() {
        // Arrange
        when(contactService.getContactProfile(eq(contactId), eq(userId)))
                .thenThrow(new RuntimeException("Not authorized to access this contact"));

        // Act
        ResponseEntity<Contact> response = contactController.getContactProfile(userId, contactId);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void getContactProfile_WhenNotFound_ShouldReturnNotFound() {
        // Arrange
        when(contactService.getContactProfile(eq(contactId), eq(userId)))
                .thenThrow(new RuntimeException("Contact not found"));

        // Act
        ResponseEntity<Contact> response = contactController.getContactProfile(userId, contactId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
    }
}
