package com.university.hometutor.Review;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.university.hometutor.usermanagement.User;
import com.university.hometutor.usermanagement.UserService;

@RestController
@RequestMapping("/api/Appreviews")
@CrossOrigin(origins = { "http://localhost:5173", "http://152.42.157.191", "https://hometutor-mu.vercel.app" },
        originPatterns = { "https://*.vercel.app" })
public class AppReviewRestController {

    @Autowired
    private AppReviewService appReviewService;

    @Autowired
    private UserService userService;

    @PostMapping("/add")
    public ResponseEntity<?> addAppReview(@RequestBody Map<String, Object> body) {
        Long userId = body.get("userId") != null ? ((Number) body.get("userId")).longValue() : null;
        int rating     = body.get("rating")     != null ? ((Number) body.get("rating")).intValue()     : 0;
        String comment = body.get("comment") != null ? (String) body.get("comment") : "";
        String reviewerName = body.get("reviewerName") != null ? (String) body.get("reviewerName") : "";
        String reviewerEmail = body.get("reviewerEmail") != null ? (String) body.get("reviewerEmail") : "";

        User user = userService.getUserById(userId);

        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Student not found.");
            return ResponseEntity.badRequest().body(error);
        }

        appReviewService.addAppReview(user, rating, comment, reviewerName, reviewerEmail);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Review submitted successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get")
    public List<AppReview> getAppReviews() {
        return appReviewService.getAppReviews();
    }
    
}
