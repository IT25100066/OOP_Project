package com.university.hometutor.Review;


import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTutor(TutorProfile tutor);

    List<Review> findByStudent(User student);


}
