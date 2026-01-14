package com.tool.atkdefbackend.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTeamRequest {
    @NotBlank
    private String name;

    private String country;

    private String affiliation;

    @com.fasterxml.jackson.annotation.JsonProperty("ip_address")
    private String ipAddress;
}
