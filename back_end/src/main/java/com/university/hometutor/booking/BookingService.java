package com.university.hometutor.booking;

import com.university.hometutor.booking.Booking;
import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.booking.BookingRepository;
import com.university.hometutor.tutormanagement.TutorProfileRepository;
import com.university.hometutor.usermanagement.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    public Booking createBooking(Long studentId, Long tutorId, LocalDate requestDate, String mode) {
        // 1. Fetch the Student (User) from the database
        // This ensures the object is "Managed" and has its password/email intact
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        // 2. Fetch the TutorProfile from the database
        TutorProfile tutor = tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found with ID: " + tutorId));

        // 3. Create and populate the Booking entity
        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setTutor(tutor);
        booking.setBookingDate(LocalDateTime.now());
        booking.setRequestDate(requestDate);
        booking.setMode(mode);
        booking.setStatus("PENDING");

        // 4. Save to the database
        // Since 'student' was fetched from the DB, Hibernate sees the password
        // and won't trigger a 'not-null property' crash.
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsForStudent(User student) {
        return bookingRepository.findByStudent(student);
    }

    public List<Booking> getBookingsForTutor(TutorProfile tutor) {
        return bookingRepository.findByTutor(tutor);
    }

    @Transactional
    public void deleteBookingByTutor(TutorProfile tutor) {
        List<Booking> bookings = bookingRepository.findByTutor(tutor);
        bookingRepository.deleteAll(bookings);
    }

    @Transactional
    public void deleteBookingsByStudent(User student) {
        List<Booking> bookings = bookingRepository.findByStudent(student);
        bookingRepository.deleteAll(bookings);
    }

   

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public void deleteBooking (Long id){
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
        } else {
            // Log this so you can see it in your Spring Boot console
            System.out.println("Delete failed: Booking ID " + id + " not found.");
            throw new RuntimeException("Booking not found");
        }
    }

    public void updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking != null) {
            booking.setStatus(status);
            bookingRepository.save(booking);
        }
    }
}
