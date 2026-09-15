package com.university.hometutor.tutormanagement;

import com.university.hometutor.tutormanagement.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {
    List<TutorProfile> findBySubjectContainingIgnoreCase(String subject);
}
