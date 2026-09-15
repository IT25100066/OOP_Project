package com.university.hometutor.messaging;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.hometutor.messaging.Massage;
import com.university.hometutor.messaging.MassageRepository;

@Service
public class MassageService {

    @Autowired
    private MassageRepository massageRepository;

    //creating a massage
    public Massage createMassage(Massage massage) {
        try{
            
            massage.setTimestamp(LocalDateTime.now());
            massage.setStatus("PENDING");
            return massageRepository.save(massage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send massage");
        }
    }

    //updating a massage
    public Massage updateMassageStatus(Long id, String status) {
        try {
            Massage existingMassage = massageRepository.findById(id).orElseThrow(() -> new RuntimeException("Massage not found"));
            existingMassage.setStatus(status);
            return massageRepository.save(existingMassage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update massage");
        }
    }

    //return all the massages
    public List<Massage> getMassages() {
        return massageRepository.findAll();
    }

    //delete the massage can be done only by admin
    public void deleteMassage(Long id) {
        try {
            massageRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete massage");
        }
    }

    public void deleteMassagesBySender(com.university.hometutor.usermanagement.User sender) {
        java.util.List<Massage> messages = massageRepository.findBySender(sender);
        massageRepository.deleteAll(messages);
    }
    
    
}
