package com.tool.atkdefbackend.model.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SignUpRequest {
    private String username;
    private String email;
    private Set<String> roles;
    private String password;
    private String confirmPassword;

}
