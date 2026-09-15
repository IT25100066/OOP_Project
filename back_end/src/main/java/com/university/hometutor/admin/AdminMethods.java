package com.university.hometutor.admin;

import java.util.List;
import java.util.Map;

public abstract class AdminMethods {

    public abstract List<Map<String, Object>> getAllBookingsMapped();
    public abstract List<Map<String, Object>> getAllStudentsMapped();
    public abstract   void deleteStudent(Long id);
    public abstract   void updateBookingStatus(Long bookingId, String status);
    public abstract    void deleteBooking(Long id);

}
