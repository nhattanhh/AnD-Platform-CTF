package com.tool.atkdefbackend.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {
    @NotBlank
    private String username;

    private String role; // STUDENT, TEACHER, TEAM

    private Integer teamId; // Optional team assignment
}
