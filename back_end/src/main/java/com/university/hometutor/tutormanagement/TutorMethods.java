package com.university.hometutor.tutormanagement;

import java.util.List;

public abstract class TutorMethods {

    public abstract List<TutorProfile> getAllTutors();

    public abstract TutorProfile getTutorById(Long id);

    public abstract TutorProfile getTutorByUserId(Long userId);

    // --- Search and Filter Methods ---

    public abstract List<TutorProfile> searchTutorsBySubject(String subject);

    public abstract List<TutorProfile> getTutorsSortedByRate();

    public abstract List<TutorProfile> getHighlyRatedTutors(double minRating);

    public abstract List<String> getDistinctSubjects();

    // --- Management Methods ---

    public abstract void updateTutorRating(Long tutorId, double newAverage);

    public abstract TutorProfile updateTutor(Long id, TutorProfile updatedTutor);

    public abstract void deleteTutor(Long id);
}
