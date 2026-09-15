package com.university.hometutor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.university.hometutor.usermanagement.CustomUserDetailsService;
import com.university.hometutor.usermanagement.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtAuthenticationFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // 1. Configure the Filter Chain (Authorization)
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())    // Disable CSRF for stateless APIs
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow preflight CORS requests
                .requestMatchers("/error").permitAll() // Allow error page without auth
                .requestMatchers("/api/auth/**").permitAll() // Anyone can log in
                    .requestMatchers(HttpMethod.GET, "/api/tutors/**").permitAll()
                    .requestMatchers("/api/auth/forgot-password", "/api/auth/reset-password","/api/email/send").permitAll()
                    // Allow anyone (incl. guests) to POST a support/contact message
                    .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()

                    // 2. ROLE SPECIFIC: Only Admins can access these
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    // Admin-only contact management (get all, delete, update status)
                    .requestMatchers(HttpMethod.GET,    "/api/contact/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/contact/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT,    "/api/contact/**").hasRole("ADMIN")

                    // 3. AUTHENTICATED: Any user with a valid JWT can access these
                    .requestMatchers(
                            "/api/reviews/**", 
                            "/api/support/**", 
                            "/api/profile/**",
                            "/api/students/**",
                            "/api/tutors/**",
                            "/api/bookings/**",
                            "/api/app-reviews/**").authenticated()


                .anyRequest().authenticated()                // Everything else requires a JWT
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
                })
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 2. Configure the Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3. Configure the Authentication Provider
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Use setAllowedOriginPatterns OR setAllowedOrigins, but be careful with wildcards
        configuration.setAllowedOriginPatterns(java.util.List.of(
                "http://localhost:5173",
            frontendUrl,
                "https://hometutor-mu.vercel.app",
                "https://*.vercel.app" // This covers preview deployments
        ));

        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        // Important: Expose headers if your frontend needs to read them (like new JWTs)
        configuration.setExposedHeaders(java.util.List.of("Authorization"));

       UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        // Register for ALL paths, not just /api/** to ensure the filter catches everything
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    
}
