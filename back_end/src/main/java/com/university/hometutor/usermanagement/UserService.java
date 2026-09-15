package com.university.hometutor.usermanagement;

import com.university.hometutor.usermanagement.User;
import com.university.hometutor.tutormanagement.TutorProfile;
import com.university.hometutor.usermanagement.UserRepository;
import com.university.hometutor.booking.BookingService;
import com.university.hometutor.messaging.MassageService;
import com.university.hometutor.Review.AppReviewService;
import com.university.hometutor.Review.ReviewService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import com.university.hometutor.tutormanagement.TutorProfileRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, TutorProfileRepository tutorProfileRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // @Lazy breaks the circular dependency: UserService <- BookingService <-
    // UserService
    @Autowired
    @Lazy
    private BookingService bookingService;

    @Autowired
    @Lazy
    private MassageService massageService;

    @Autowired
    @Lazy
    private AppReviewService appReviewService;

    @Autowired
    @Lazy
    private ReviewService reviewService;

    public List<User> getAllStudents() {
        List<User> users = userRepository.findByRole("STUDENT");
        System.out.println("Students found in DB: " + users.size());
        return users;
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        // 1. Delete app-level reviews written by this user (AppReview.user_id FK)
        appReviewService.deleteAppReviewsByUser(user);
        // 2. Delete tutor reviews written by this student (Review.student_id FK)
        reviewService.deleteReviewsByStudent(user);
        // 3. Delete messages sent by this user (Massage.sender_id FK)
        massageService.deleteMassagesBySender(user);
        // 4. Delete bookings made by this student (Booking.student_id FK)
        bookingService.deleteBookingsByStudent(user);
        // 5. Now safe to delete the user
        userRepository.deleteById(id);
    }

    public User registerUser(User user) {
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    @Transactional
    public User registerTutor(Map<String, Object> body) {

        // Build User from the request body
        User user = new User();
        user.setName((String) body.get("name"));
        user.setUsername((String) body.get("username"));
        user.setEmail((String) body.get("email"));
        user.setPassword((String) body.get("password"));
        user.setRole("TUTOR");

        // Build TutorProfile from the request body
        TutorProfile profile = new TutorProfile();
        profile.setSubject((String) body.get("subject"));
        String bio = (String) body.get("bio");
        profile.setBio(bio != null ? bio : "");

        Object hourlyRateObj = body.get("hourlyRate");
        if (hourlyRateObj != null) {
            if (hourlyRateObj instanceof Number) {
                profile.setHourlyRate(((Number) hourlyRateObj).doubleValue());
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("TUTOR");
        User savedUser = userRepository.save(user);
        profile.setUser(savedUser);
        tutorProfileRepository.save(profile);
        return savedUser;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User loginUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt.get();
        }

        return null;
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // Register Admin
    @Transactional
    public User registerAdmin(Map<String, Object> body) {

        User admin = new User();
        admin.setName((String) body.get("name"));
        admin.setUsername((String) body.get("username"));
        admin.setEmail((String) body.get("email"));
        admin.setPassword((String) body.get("password"));

        // 1. Check if username already exists
        if (userRepository.findByUsername(admin.getUsername()).isPresent()) {
            throw new RuntimeException("Admin username already taken.");
        }

        // 2. Encode password and set Admin role
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole("ADMIN");

        return userRepository.save(admin);
    }

    // update password
    @Transactional
    public void updatePassword(String email, String newPassword) {

        // 1. Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Hash password
        String encodedPassword = passwordEncoder.encode(newPassword);

        // 3. Update password
        user.setPassword(encodedPassword);

        // 4. Save user
        userRepository.save(user);
    }

}
