package com.tool.atkdefbackend.dto.submission;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for paginated submission list.
 * Matches Python Core API response format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubmissionListResponse {

    // Core API may return 'items' instead of 'submissions'
    private List<SubmissionResponse> items;
    private List<SubmissionResponse> submissions;
    private Integer total;
    private Integer skip;
    private Integer limit;
    
    @JsonProperty("has_more")
    private Boolean hasMore;
    
    /**
     * Get submissions from whichever field is populated.
     */
    public List<SubmissionResponse> getSubmissionList() {
        return items != null ? items : submissions;
    }
}
