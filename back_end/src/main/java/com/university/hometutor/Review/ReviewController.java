package com.university.hometutor.Review;

import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.tutormanagement.TutorService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private TutorService tutorService;

    @PostMapping("/add")
    public String addReview(
            @RequestParam Long tutorId,
            @RequestParam int rating,
            @RequestParam String comment,
            HttpSession session,
            Model model) {

        User loggedInUser = (User) session.getAttribute("loggedInUser");
        if (loggedInUser == null || !"STUDENT".equals(loggedInUser.getRole())) {
            return "redirect:/login";
        }

        TutorProfile tutor = tutorService.getTutorById(tutorId);
        if (tutor != null) {
            reviewService.addReview(loggedInUser, tutor, rating, comment);
        }

        return "redirect:/student/dashboard?reviewSuccess=true";
    }
}
