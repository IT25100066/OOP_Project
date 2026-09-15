package com.university.hometutor.booking;

import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;
import jakarta.persistence.*;


import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {

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
    private LocalDateTime bookingDate;

    // Requested date by the student
    @Column(name = "request_date")
    private LocalDate requestDate;

    @Column(nullable = false)
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    @Column(nullable = false)
    private String mode; // ONLINE, IN_PERSON, HYBRID   

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getMode() {
        return mode;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public void setTutor(TutorProfile tutor) {
        this.tutor = tutor;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public TutorProfile getTutor() {
        return tutor;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public String getStatus() {
        return status;
    }
}
