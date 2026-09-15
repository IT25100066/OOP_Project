package com.university.hometutor.usermanagement;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Extract the Authorization Header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Check if the header is missing or doesn't start with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // Move to the next filter (which will likely reject the request if it's protected)
        }

        // 3. Extract the token (Remove "Bearer " from the string)
        jwt = authHeader.substring(7);

        try {
            username = jwtService.extractUsername(jwt);

            // 4. If we have a username and the user is NOT already authenticated
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Fetch the user from the database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // 5. Validate the token
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 6. Tell Spring Security that this user is legitimately authenticated!
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Update the security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // If the token is expired or malformed, we just let it fail silently here.
            // Spring Security will automatically block them later in the chain.
            System.out.println("JWT Filter Error: " + e.getMessage());
        }

        // 7. Continue the request down the chain
        filterChain.doFilter(request, response);
    }
}