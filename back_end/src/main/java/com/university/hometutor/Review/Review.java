package com.university.hometutor.Review;

import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;
import jakarta.persistence.*;


import java.time.LocalDateTime;



@Entity
@Table(name = "reviews")
public class Review {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private TutorProfile tutor;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(length = 500)
    private String comment;

    private LocalDateTime reviewDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public TutorProfile getTutor() {
        return tutor;
    }

    public void setTutor(TutorProfile tutor) {
        this.tutor = tutor;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDateTime reviewDate) {
        this.reviewDate = reviewDate;
    }
}
