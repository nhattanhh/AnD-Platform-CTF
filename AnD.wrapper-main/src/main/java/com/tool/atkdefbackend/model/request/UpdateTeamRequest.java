package com.tool.atkdefbackend.model.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTeamRequest {
    private String name;

    private String country;

    private String affiliation;

    @com.fasterxml.jackson.annotation.JsonProperty("ip_address")
    private String ipAddress;
}
