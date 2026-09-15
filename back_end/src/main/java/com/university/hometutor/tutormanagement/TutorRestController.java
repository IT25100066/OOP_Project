package com.university.hometutor.tutormanagement;

import com.university.hometutor.booking.Booking;
import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.booking.BookingService;
import com.university.hometutor.searchandfilter.MergeSort;
import com.university.hometutor.tutormanagement.TutorService;
import com.university.hometutor.usermanagement.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/tutors")
public class TutorRestController {

    @Autowired
    private TutorService tutorService;

    @Autowired
    private UserService userService;

    @Autowired
    private BookingService bookingService;

    // -------------------------------------------------------------------
    // GET /api/tutors/subjects
    // Returns a list of distinct subjects for filter dropdown
    // -------------------------------------------------------------------
    @GetMapping("/subjects")
    public List<String> getDistinctSubjects() {
        return tutorService.getDistinctSubjects();
    }

    // -------------------------------------------------------------------
    // GET /api/tutors
    // Optional query params (can be combined):
    // ?subject=Math → filter by subject (case-insensitive)
    // ?sortBy=rate → sort by hourly rate ascending (MergeSort DSA)
    // ?minRating=4.0 → filter by minimum average rating (BST DSA)
    // -------------------------------------------------------------------
    @GetMapping
    public List<Map<String, Object>> getAllTutors(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Double minRating) {

        // 1. Start with all tutors or filtered by subject
        List<TutorProfile> tutors;

        if (subject != null && !subject.isBlank()) {
            tutors = tutorService.searchTutorsBySubject(subject);
        } else {
            tutors = tutorService.getAllTutors();
        }

        // 2. Apply minimum rating filter using Binary Search Tree (DSA)
        if (minRating != null && minRating > 0) {
            tutors = tutorService.filterByMinRating(tutors, minRating);
        }

        // 3. Apply sort by hourly rate using Merge Sort (DSA)
        if ("rate".equals(sortBy)) {
            List<TutorProfile> mutableList = new ArrayList<>(tutors);
            MergeSort.sortByHourlyRate(mutableList);
            tutors = mutableList;
        }

        return tutors.stream()
                .map(this::tutorToMap)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TutorProfile> updateTutor(@PathVariable Long id, @RequestBody TutorProfile tutorDetails) {
        try {
            TutorProfile updatedTutor = tutorService.updateTutor(id, tutorDetails);
            return ResponseEntity.ok(updatedTutor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // -------------------------------------------------------------------
    // GET /api/tutors/{id}
    // Returns a single tutor's full profile
    // -------------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorById(@PathVariable Long id) {
        TutorProfile tutor = tutorService.getTutorById(id);
        if (tutor == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tutor not found.");
            return ResponseEntity.status(404).body(error);
        }
        return ResponseEntity.ok(tutorToMap(tutor));
    }

    // DELETE /api/tutors/{id} (admin only — no auth check here, trust frontend)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTutor(@PathVariable Long id) {
        try {
            TutorProfile tutor = tutorService.getTutorById(id);
            if (tutor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Tutor not found.");
                return ResponseEntity.status(404).body(error);
            }
            tutorService.deleteTutor(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Tutor deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete tutor: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }


    // GET /api/tutors/my-bookings?userId={userId}
    // Returns all bookings for the tutor associated with the given user id.

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(@RequestParam Long userId) {
        TutorProfile profile = tutorService.getTutorByUserId(userId);
        if (profile == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "No tutor profile found for this user.");
            return ResponseEntity.status(404).body(error);
        }
        List<Booking> bookings = bookingService.getBookingsForTutor(profile);

        return ResponseEntity.ok(bookings);
    }

    // -------------------------------------------------------------------
    // PUT /api/tutors/bookings/{bookingId}/status
    // Body: { "status": "CONFIRMED" } or { "status": "CANCELLED" }
    // -------------------------------------------------------------------
    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (!List.of("CONFIRMED", "CANCELLED", "COMPLETED").contains(status)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid status. Use CONFIRMED, CANCELLED or COMPLETED.");
            return ResponseEntity.badRequest().body(error);
        }
        bookingService.updateBookingStatus(bookingId, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking status updated to " + status);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> tutorToMap(TutorProfile t) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", t.getId());
        map.put("subject", t.getSubject());
        map.put("bio", t.getBio());
        map.put("hourlyRate", t.getHourlyRate());
        map.put("averageRating", t.getAverageRating());
        if (t.getUser() != null) {
            map.put("name", t.getUser().getName());
            map.put("email", t.getUser().getEmail());
            map.put("username", t.getUser().getUsername());
            map.put("userId", t.getUser().getId());
        }
        return map;
    }

}
