package com.university.hometutor.messaging;

import com.university.hometutor.usermanagement.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.university.hometutor.messaging.Massage;
import java.util.List;

// repository part which is connected to database
@Repository
public interface MassageRepository extends JpaRepository<Massage, Long> {
    List<Massage> findBySender(User sender);
}
