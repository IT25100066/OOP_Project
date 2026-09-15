package com.university.hometutor.Review;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.hometutor.usermanagement.User;

@Service
public class AppReviewService {

    @Autowired
    private AppReviewRepository appReviewRepository;

    public List<AppReview> getAllAppReviews() {
        return appReviewRepository.findAll();
    }

    public AppReview addAppReview(User user, int rating, String comment , String reviewerName , String reviewerEmail) {

        AppReview review = new AppReview();
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);
        review.setReviewerName(reviewerName);
        review.setReviewerEmail(reviewerEmail);
        review.setCreatedAt(LocalDateTime.now()); // Don't forget this!
        return appReviewRepository.save(review);


    }

    public List<AppReview> getAppReviews() {
        return appReviewRepository.findAll();
    }


    public void deleteAppReviewsByUser(User user) {
        List<AppReview> reviews = appReviewRepository.findByUser(user);
        appReviewRepository.deleteAll(reviews);
    }

    
}
