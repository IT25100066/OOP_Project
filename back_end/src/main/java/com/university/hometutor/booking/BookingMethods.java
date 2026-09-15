package com.university.hometutor.booking;

import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.User;

import java.time.LocalDate;
import java.util.List;

public abstract class BookingMethods {
    public abstract Booking createBooking(Long studentId, Long tutorId, LocalDate requestDate, String mode);

    // --- Retrieval Methods ---

    public abstract List<Booking> getAllBookings();

    public abstract List<Booking> getBookingsForStudent(User student);

    public abstract List<Booking> getBookingsForTutor(TutorProfile tutor);

    // --- State Management ---

    public abstract void updateBookingStatus(Long bookingId, String status);

    // --- Deletion & Cleanup ---

    public abstract void deleteBooking(Long id);

    public abstract void deleteBookingByTutor(TutorProfile tutor);


    public abstract void deleteBookingsByStudent(User student);
}
