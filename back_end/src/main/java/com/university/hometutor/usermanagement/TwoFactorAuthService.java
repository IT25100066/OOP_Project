package com.university.hometutor.usermanagement;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.hometutor.Util.EmailService;

@Service
public class TwoFactorAuthService {
    @Autowired
    private EmailService emailService;

    private static final long OTP_LIFETIME_SECONDS = 300;
    private static final int MAX_ATTEMPTS = 5;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    public void generateAndSendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        otpStorage.put(normalizedEmail, new OtpEntry(otp, Instant.now().plusSeconds(OTP_LIFETIME_SECONDS)));
        String subject = "Your 2FA Registration Code";
        String text = "Your verification code is: " + otp + "\n\nThis code will be used to complete your registration.";
        emailService.sendEmail(normalizedEmail, subject, text);
    }

    public boolean verifyOtp(String email, String otp) {
        if (email == null || otp == null) return false;
        String normalizedEmail = normalizeEmail(email);
        OtpEntry entry = otpStorage.get(normalizedEmail);
        if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
            otpStorage.remove(normalizedEmail);
            return false;
        }
        if (entry.attempts() >= MAX_ATTEMPTS) {
            otpStorage.remove(normalizedEmail);
            return false;
        }
        entry.incrementAttempts();
        if (entry.code().equals(otp.trim())) {
            otpStorage.remove(normalizedEmail);
            return true;
        }
        return false;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private static final class OtpEntry {
        private final String code;
        private final Instant expiresAt;
        private final AtomicInteger attempts = new AtomicInteger();

        private OtpEntry(String code, Instant expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }

        private String code() {
            return code;
        }

        private Instant expiresAt() {
            return expiresAt;
        }

        private int attempts() {
            return attempts.get();
        }

        private void incrementAttempts() {
            attempts.incrementAndGet();
        }
    }
}
