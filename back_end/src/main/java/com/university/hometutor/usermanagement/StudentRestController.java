package com.university.hometutor.usermanagement;

import com.university.hometutor.booking.Booking;
import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.booking.BookingService;
import com.university.hometutor.tutormanagement.TutorService;
import com.university.hometutor.usermanagement.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for student bookings.
 * Students identify themselves by sending their userId in the request.
 * No JWT — authentication is trusting the frontend-stored userId.
 */
@RestController
@RequestMapping("/api/students")
public class StudentRestController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private TutorService tutorService;

    @Autowired
    private UserService userService;

    // -------------------------------------------------------------------
    // GET /api/students/{studentId}/bookings
    // Returns all bookings for the given student
    // -------------------------------------------------------------------
    @GetMapping("/{studentId}/bookings")
    public ResponseEntity<?> getBookings(@PathVariable Long studentId) {
        User student = userService.getUserById(studentId);
        if (student == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Student not found.");
            return ResponseEntity.status(404).body(error);
        }
        List<Booking> bookings = bookingService.getBookingsForStudent(student);
        return ResponseEntity.ok(bookings.stream().map(this::bookingToMap).collect(Collectors.toList()));
    }

    // -------------------------------------------------------------------
    // POST /api/students/{studentId}/book/{tutorId}
    // Creates a new booking for the student with the given tutor
    // -------------------------------------------------------------------
    @PostMapping("/{studentId}/book/{tutorId}")
    public ResponseEntity<?> bookTutor(
            @PathVariable Long studentId,
            @PathVariable Long tutorId,
            @RequestBody Map<String, String> payload) {

        try {
            LocalDate requestDate = null;
            if (payload.containsKey("requestDate") && !payload.get("requestDate").isEmpty()) {
                requestDate = LocalDate.parse(payload.get("requestDate"));
            }
            String mode = payload.getOrDefault("mode", "ONLINE"); // Fallback if missing

            // Pass IDs only. The Service will handle the fetching and validation.
            Booking booking = bookingService.createBooking(studentId, tutorId, requestDate, mode);
            return ResponseEntity.ok(bookingToMap(booking));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    private Map<String, Object> bookingToMap(Booking b) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("bookingDate", b.getBookingDate() != null ? b.getBookingDate().toString() : null);
        map.put("requestDate", b.getRequestDate() != null ? b.getRequestDate().toString() : null);
        map.put("mode", b.getMode());
        map.put("status", b.getStatus());

        if (b.getTutor() != null) {
            Map<String, Object> tutorInfo = new HashMap<>();
            tutorInfo.put("id", b.getTutor().getId());
            tutorInfo.put("subject", b.getTutor().getSubject());
            if (b.getTutor().getUser() != null) {
                tutorInfo.put("username", b.getTutor().getUser().getUsername());
                tutorInfo.put("name", b.getTutor().getUser().getName());
                tutorInfo.put("email", b.getTutor().getUser().getEmail());
            }
            map.put("tutor", tutorInfo);
        }
        return map;
    }
}
