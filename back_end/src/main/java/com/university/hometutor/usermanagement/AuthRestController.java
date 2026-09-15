package com.university.hometutor.usermanagement;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.university.hometutor.usermanagement.PasswordReset.PasswordResetService;
import com.university.hometutor.usermanagement.PasswordReset.ResetPasswordRequest;
import com.university.hometutor.usermanagement.PasswordReset.forgetPasswordRequest;


/**
 * REST controller for login and registration.
 * No JWT – we return user info (id, role, name) that the frontend stores in
 * localStorage.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private TwoFactorAuthService twoFactorAuthService;

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService; // You will write this utility class

    public AuthRestController(AuthenticationManager authManager, JwtService jwtService) {
        this.authenticationManager = authManager;
        this.jwtService = jwtService;
    }

    // -------------------------------------------------------------------
    // POST /api/auth/login
    // Body: { "username": "...", "password": "..." }
    // Returns: { "id": 1, "name": "...", "username": "...", "role": "ADMIN" }
    // -------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        try {
            // 1. Authenticate credentials (this throws an exception if wrong)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // 2. Fetch the user details from your database to build the profile
            // (Make sure your userService has a method like findByUsername!)
            User user = userService.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found."));
            }

            // 3. Generate the JWT Token
            String token = jwtService.generateToken(user.getUsername());

            // 4. Build the user object
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());

            // 5. Wrap BOTH the token and user data in the final response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userData);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            // Catch the exception thrown by authenticationManager if passwords don't match or other auth errors
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password.");
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/send-2fa-code")
    public ResponseEntity<?> send2faCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        try {
            twoFactorAuthService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of("message", "2FA code sent successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send 2FA code: " + e.getMessage()));
        }
    }

    // -------------------------------------------------------------------
    // POST /api/auth/register/student
    // Body: { "name": "...", "username": "...", "email": "...", "password": "...", "otp": "..." }
    // -------------------------------------------------------------------
    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody User user) {
        try {
            // Validate OTP
            if (!twoFactorAuthService.verifyOtp(user.getEmail(), user.getOtp())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired 2FA code"));
            }

            // Validation: Ensure required fields are present
            if (user.getPassword() == null || user.getUsername() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing credentials"));
            }

            user.setRole("STUDENT");
            userService.registerUser(user); // registerUser encodes the password
            return ResponseEntity.ok(Map.of("message", "Student registered successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    // -------------------------------------------------------------------
    // POST /api/auth/register/tutor
    // Body: { "name": "...", "username": "...", "email": "...", "password": "...",
    // "subject": "...", "hourlyRate": 500.0, "bio": "..." }
    // -------------------------------------------------------------------
    @PostMapping("/register/tutor")
    public ResponseEntity<?> registerTutor(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String otp = (String) body.get("otp");
            if (!twoFactorAuthService.verifyOtp(email, otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired 2FA code"));
            }
            userService.registerTutor(body);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Tutor registered successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed. Username may already exist.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    //Register Admin
    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, Object> body) {
        try {
            String email = (String) body.get("email");
            String otp = (String) body.get("otp");
            if (!twoFactorAuthService.verifyOtp(email, otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired 2FA code"));
            }

            // Simple security check: Only someone who knows this key can create an admin
            String secretKey = (String) body.get("secretKey");
            if (!"HomeTutorAdmin@#2026".equals(secretKey)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Invalid Secret Key"));
            }

            userService.registerAdmin(body);

            return ResponseEntity.ok(Map.of("message", "Admin account created successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody forgetPasswordRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            passwordResetService.ForgotPassword(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "If the email is registered, a password reset link will be sent."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Unable to process password reset request"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {

        String email = passwordResetService.validateToken(request.getToken());
        String newPassword = request.getNewPassword();
        if (email == null) {
            return ResponseEntity.badRequest().body("Invalid or expired token!");
        }
        // Update password (IMPORTANT: hash it in real apps)
        // userService.updatePassword(email, newPassword);
        userService.updatePassword(email, newPassword);
        passwordResetService.removeToken(request.getToken());
        return ResponseEntity.ok("Password updated successfully!");
    }
}
