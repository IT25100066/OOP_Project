package com.university.hometutor.Review;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.university.hometutor.usermanagement.User;


public interface AppReviewRepository  extends JpaRepository<AppReview, Long>{

    List<AppReview> findByUser(User user);



    
}
