package com.university.hometutor.usermanagement.PasswordReset;

import lombok.Getter;

public class forgetPasswordRequest {
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
