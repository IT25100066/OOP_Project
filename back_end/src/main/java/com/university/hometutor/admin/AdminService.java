package com.university.hometutor.admin;

import com.university.hometutor.booking.Booking;
import com.university.hometutor.booking.BookingService;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.usermanagement.UserService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService extends AdminMethods {

    private final BookingService bookingService;
    private final UserService userService;

    public AdminService(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    public List<Map<String, Object>> getAllBookingsMapped() {
        return bookingService.getAllBookings().stream()
                .map(this::bookingToMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllStudentsMapped() {
        return userService.getAllStudents().stream()
                .map(this::studentToMap)
                .collect(Collectors.toList());
    }

    public void deleteStudent(Long id) {
        userService.deleteUser(id);
    }

    public void updateBookingStatus(Long bookingId, String status) {
        bookingService.updateBookingStatus(bookingId, status);
    }

    public void deleteBooking(Long id) {
        bookingService.deleteBooking(id);
    }

    private Map<String, Object> studentToMap(User student) {
        if (student == null) return null;
        Map<String, Object> map = new HashMap<>();
        map.put("id", student.getId());
        map.put("username", student.getUsername());
        map.put("name", student.getName());
        map.put("email", student.getEmail());
        map.put("role", student.getRole());
        return map;
    }

    private Map<String, Object> bookingToMap(Booking b) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("bookingDate", b.getBookingDate().toString());
        map.put("status", b.getStatus());

        if (b.getStudent() != null) {
            Map<String, Object> s = new HashMap<>();
            s.put("id", b.getStudent().getId());
            s.put("username", b.getStudent().getUsername());
            s.put("name", b.getStudent().getName());
            s.put("email", b.getStudent().getEmail());
            map.put("student", s);
        }

        if (b.getTutor() != null) {
            Map<String, Object> t = new HashMap<>();
            t.put("id", b.getTutor().getId());
            t.put("subject", b.getTutor().getSubject());
            if (b.getTutor().getUser() != null) {
                t.put("username", b.getTutor().getUser().getUsername());
                t.put("name", b.getTutor().getUser().getName());
                t.put("email", b.getTutor().getUser().getEmail());
            }
            map.put("tutor", t);
        }
        return map;
    }
}