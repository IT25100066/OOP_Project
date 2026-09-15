package com.university.hometutor.Review;

import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.tutormanagement.TutorService;
import com.university.hometutor.usermanagement.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private TutorService tutorService;

    public Review addReview(User student, TutorProfile tutor, int rating, String comment) {
        Review review = new Review();
        review.setStudent(student);
        review.setTutor(tutor);
        review.setRating(rating);
        review.setComment(comment);
        review.setReviewDate(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);

        // Update tutor's average rating
        updateTutorAverageRating(tutor);

        return savedReview;
    }

    public List<Review> getReviewsForTutor(TutorProfile tutor) {
        return reviewRepository.findByTutor(tutor);
    }

    private void updateTutorAverageRating(TutorProfile tutor) {
        List<Review> reviews = getReviewsForTutor(tutor);
        if (reviews.isEmpty())
            return;

        double sum = 0;
        for (Review r : reviews) {
            sum += r.getRating();
        }
        double average = sum / reviews.size();
        tutorService.updateTutorRating(tutor.getId(), average);
    }

    @jakarta.transaction.Transactional
    public void deleteReviewsByStudent(User student) {
        List<Review> reviews = reviewRepository.findByStudent(student);
        reviewRepository.deleteAll(reviews);
    }

    @jakarta.transaction.Transactional
    public void deleteReviewsByTutor(TutorProfile tutor) {
        List<Review> reviews = reviewRepository.findByTutor(tutor);
        reviewRepository.deleteAll(reviews);
    }
}
