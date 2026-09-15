package com.university.hometutor.usermanagement.PasswordReset;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.university.hometutor.Util.EmailService;

@Service
public class PasswordResetService {

    private static final long TOKEN_LIFETIME_SECONDS = 900;
    private final Map<String, ResetToken> tokenStore = new ConcurrentHashMap<>();

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void ForgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        String token = UUID.randomUUID().toString();
        tokenStore.put(token, new ResetToken(
                normalizedEmail,
                Instant.now().plusSeconds(TOKEN_LIFETIME_SECONDS)));

        String resetLink = frontendUrl + "/PasswordReset?token=" + token;
        String subject = "Password Reset Request Hometutor User ";
        String message = "Click the link to reset your password:\n" + resetLink;

        emailService.sendEmail(normalizedEmail, subject, message);
    }

    public String validateToken(String token) {
        if (token == null) {
            return null;
        }
        ResetToken resetToken = tokenStore.get(token);
        if (resetToken == null || Instant.now().isAfter(resetToken.expiresAt())) {
            tokenStore.remove(token);
            return null;
        }
        return resetToken.email();
    }

    public void removeToken(String token) {
        tokenStore.remove(token);
    }

    private record ResetToken(String email, Instant expiresAt) {
    }

}
