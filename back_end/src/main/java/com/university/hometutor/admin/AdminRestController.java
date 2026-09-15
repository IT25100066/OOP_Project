package com.university.hometutor.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final AdminService adminService;

    public AdminRestController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/bookings")
    public List<Map<String, Object>> getAllBookings() {
        return adminService.getAllBookingsMapped();
    }

    @GetMapping("/getStudents")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudentsMapped());
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        adminService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(Map.of("message", "Status updated to " + status));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable("id") Long id) {
        try {
            adminService.deleteBooking(id);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}