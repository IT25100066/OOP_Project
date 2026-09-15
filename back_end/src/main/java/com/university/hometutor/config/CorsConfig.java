package com.university.hometutor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allow the React frontend (Vite dev server on port 5173)
 * to call our REST APIs without CORS errors.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // only our REST routes
                .allowedOriginPatterns("*", "https://*.vercel.app")
                .allowedOrigins("http://localhost:5173",
                        "https://your-production-domain.com", // if having a domain
                        "https://hometutor-mu.vercel.app")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true); // allow session cookies if needed
    }
}
