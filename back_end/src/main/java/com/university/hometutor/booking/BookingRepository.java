package com.university.hometutor.booking;

import com.university.hometutor.booking.Booking;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.tutormanagement.TutorProfile;
import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudent(User student);

    List<Booking> findByTutor(TutorProfile tutor);


}
