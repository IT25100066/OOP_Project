package com.university.hometutor.Review;

import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.tutormanagement.TutorService;
import com.university.hometutor.usermanagement.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for submitting and reading tutor reviews.
 */
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = { "http://localhost:5173", "http://152.42.157.191", "https://hometutor-mu.vercel.app" },
        originPatterns = { "https://*.vercel.app" })
public class ReviewRestController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private TutorService tutorService;

    @Autowired
    private UserService userService;

    // -------------------------------------------------------------------
    // POST /api/reviews
    // Body: { "studentId": 1, "tutorId": 2, "rating": 5, "comment": "..." }
    // -------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> body) {
        Long studentId = body.get("studentId") != null ? ((Number) body.get("studentId")).longValue() : null;
        Long tutorId   = body.get("tutorId")   != null ? ((Number) body.get("tutorId")).longValue()   : null;
        int rating     = body.get("rating")     != null ? ((Number) body.get("rating")).intValue()     : 0;
        String comment = body.get("comment") != null ? (String) body.get("comment") : "";

        User student = userService.getUserById(studentId);
        TutorProfile tutor = tutorService.getTutorById(tutorId);

        if (student == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Student not found.");
            return ResponseEntity.badRequest().body(error);
        }
        if (tutor == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tutor not found.");
            return ResponseEntity.badRequest().body(error);
        }

        reviewService.addReview(student, tutor, rating, comment);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review submitted successfully.");
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------
    // GET /api/reviews/tutor/{tutorId}
    // Gets all reviews for a specific tutor
    // -------------------------------------------------------------------
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getReviewsForTutor(@PathVariable Long tutorId) {
        TutorProfile tutor = tutorService.getTutorById(tutorId);
        if (tutor == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tutor not found.");
            return ResponseEntity.status(404).body(error);
        }
        List<Review> reviews = reviewService.getReviewsForTutor(tutor);
        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("reviewDate", r.getReviewDate() != null ? r.getReviewDate().toString() : null);
            if (r.getStudent() != null) {
                map.put("studentUsername", r.getStudent().getUsername());
                map.put("studentName", r.getStudent().getName());
            }
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
