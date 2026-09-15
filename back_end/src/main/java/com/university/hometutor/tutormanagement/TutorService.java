package com.university.hometutor.tutormanagement;

import com.university.hometutor.booking.BookingMethods;
import com.university.hometutor.booking.BookingService;

import com.university.hometutor.searchandfilter.BinarySearchTree;
import com.university.hometutor.searchandfilter.MergeSort;
import com.university.hometutor.Review.ReviewService;
import com.university.hometutor.Review.AppReviewService;
import com.university.hometutor.messaging.MassageService;
import com.university.hometutor.usermanagement.User;
import com.university.hometutor.usermanagement.UserRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TutorService extends TutorMethods {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private ReviewService reviewService;

    @Autowired
    @Lazy
    private AppReviewService appReviewService;

    @Autowired
    @Lazy
    private MassageService massageService;

    @Override
    public List<TutorProfile> getAllTutors() {
        return tutorProfileRepository.findAll();
    }

    // Use Custom DSA 1: MergeSort to sort by rate
    public List<TutorProfile> getTutorsSortedByRate() {
        List<TutorProfile> tutors = tutorProfileRepository.findAll();
        MergeSort.sortByHourlyRate(tutors);
        return tutors;
    }

    // Use Custom DSA 2: Binary Search Tree to filter by rating efficiently
    @Override
    public List<TutorProfile> getHighlyRatedTutors(double minRating) {
        List<TutorProfile> tutors = tutorProfileRepository.findAll();
        BinarySearchTree bst = new BinarySearchTree();
        for (TutorProfile tutor : tutors) {
            // Need to handle initially null ratings if any
            if (tutor.getAverageRating() == null)
                tutor.setAverageRating(0.0);
            bst.insert(tutor);
        }
        return bst.findHighlyRated(minRating);
    }

    // Filter an already-fetched list by minimum rating using BST (DSA)

    public List<TutorProfile> filterByMinRating(List<TutorProfile> tutors, double minRating) {
        BinarySearchTree bst = new BinarySearchTree();
        for (TutorProfile tutor : tutors) {
            if (tutor.getAverageRating() == null)
                tutor.setAverageRating(0.0);
            bst.insert(tutor);
        }
        return bst.findHighlyRated(minRating);
    }

    @Override
    public List<TutorProfile> searchTutorsBySubject(String subject) {
        return tutorProfileRepository.findBySubjectContainingIgnoreCase(subject);
    }

    // Get all distinct subjects for the filter dropdown
    @Override
    public List<String> getDistinctSubjects() {
        return tutorProfileRepository.findAll().stream()
                .map(TutorProfile::getSubject)
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public TutorProfile getTutorById(Long id) {
        return tutorProfileRepository.findById(id).orElse(null);
    }

    public TutorProfile getTutorByUserId(Long userId) {
        return tutorProfileRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public void updateTutorRating(Long tutorId, double newAverage) {
        TutorProfile tutor = getTutorById(tutorId);
        if (tutor != null) {
            tutor.setAverageRating(newAverage);
            tutorProfileRepository.save(tutor);
        }
    }

    // Delete a tutor profile by id (used by admin REST endpoint)
    @Override
    @Transactional
    public void deleteTutor(Long id) {
        TutorProfile tutor = getTutorById(id);
        User user = tutor.getUser();
        if (user != null) {
            // 1. Delete all tutor reviews (Review.tutor_id FK)
            reviewService.deleteReviewsByTutor(tutor);
            // 2. Delete all app reviews linked to this tutor profile (AppReview.tutor_id FK
            // if any)
            appReviewService.deleteAppReviewsByUser(user);
            // 3. Delete associated bookings (Booking.tutor_id FK)
            bookingService.deleteBookingByTutor(tutor);
            // 4. Delete messages sent by this user (Massage.sender_id FK)
            massageService.deleteMassagesBySender(user);

            // 5. Save the user ID before deleting the profile
            Long userId = tutor.getUser().getId();

            // 6. Delete the tutor profile
            tutorProfileRepository.deleteById(id);

            // 7. Delete the associated user account so they aren't orphaned
            userRepository.deleteById(userId);
        } else {
            throw new RuntimeException("Tutor not found");
        }
    }

    @Override
    public TutorProfile updateTutor(Long id, TutorProfile updatedTutor) {
        return tutorProfileRepository.findById(id)
                .map(tutor -> {
                    tutor.setSubject(updatedTutor.getSubject());
                    tutor.setBio(updatedTutor.getBio());
                    tutor.setHourlyRate(updatedTutor.getHourlyRate());
                    return tutorProfileRepository.save(tutor);
                }).orElseThrow(() -> new RuntimeException("Tutor not found"));
    }
}
