# Home Tutor Search and Booking System

## Overview
This is a university Object-Oriented Programming (OOP) project implementing a web-based "Home Tutor Search and Booking System". It's built using Java, Spring Boot, MySQL, and JSP/HTML/CSS.

## Key Features
- **Admin**: Dashboard to view and force-update global booking statuses.
- **Search & Filter**: Incorporates custom DSA (Merge Sort and Binary Search Tree) for sorting tutors by rate and efficiently finding highly-rated tutors.
- **User (Student)**: Dashboard to track bookings, securely register/login, and view statuses.
- **Booking & Scheduling**: Send booking requests to tutors and view real-time status updates (Pending, Confirmed, Completed, Cancelled).
- **Tutor**: Dedicated tutor dashboard to manage profile details and accept/reject student requests.
- **Feedback & Review**: Allows students to leave a 1-5 star rating and comment on completed bookings.

## Tech Stack
- **Backend:** Java 17, Spring Boot, Spring Data JPA
- **Frontend:** JSP, HTML, Custom CSS (Glassmorphism theme)
- **Database:** MySQL
- **Custom DSA:** `MergeSort.java` and `BinarySearchTree.java`

## Setup & Running Instructions

1. **Database Setup**
    - Ensure MySQL is running on your system (`localhost:3306`).
    - Create a database named `hometutor_database`:
     ```sql
       CREATE DATABASE hometutor_database;
     ```
    - Copy the repository's `.env.example` to `.env` and set your MySQL username and password.
    - To enable OTP and password-reset emails, set `MAIL_ENABLED=true` and configure the `MAIL_*` values in `.env`.

2. **Run the Application**
   - Import the project into **IntelliJ IDEA** as a Maven project.
   - Run the main class `HomeTutorApplication.java`.
   - Alternatively, use the terminal:
     ```bash
     mvn spring-boot:run
     ```

3. **Access the System**
   - Open your browser and navigate to: `http://localhost:8080/`
   - Create an Admin, Tutor, and Student account to test the complete flow.

## Demo Sequence
1. Register a Tutor account (fill out subject, rate, bio).
2. Register a Student account.
3. Login as the Student -> Search Tutors -> Test the "Sort by Rate" (Merge Sort) and "4+ Stars" (BST).
4. Book a tutor -> Logs into the Tutor account -> Accepts the booking.
5. Login to Admin account -> Mark the booking as "Completed".
6. Login back to Student account -> Leave a Review for the completed booking.
