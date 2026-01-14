package com.tool.atkdefbackend.dto.game;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for paginated game list.
 * Matches Python Core API response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameListResponse {

    private List<GameResponse> games;
    private Integer total;
    private Integer skip;
    private Integer limit;
    
    @JsonProperty("has_more")
    private Boolean hasMore;
}
