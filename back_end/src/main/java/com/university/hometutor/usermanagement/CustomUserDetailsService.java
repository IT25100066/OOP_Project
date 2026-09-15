package com.university.hometutor.usermanagement;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User dbUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String role = dbUser.getRole();
        if (role == null) {
            role = "USER"; // Default fallback role
        }

        // Convert your custom User entity to Spring Security's UserDetails interface
        return org.springframework.security.core.userdetails.User.builder()
                .username(dbUser.getUsername())
                .password(dbUser.getPassword())
                .roles(role.replace("ROLE_", "")) // Spring adds "ROLE_" automatically
                .build();
    }


}
