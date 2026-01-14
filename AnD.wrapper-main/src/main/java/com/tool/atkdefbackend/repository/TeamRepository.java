package com.tool.atkdefbackend.repository;

import com.tool.atkdefbackend.entity.TeamEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Team entity operations.
 * 
 * Teams are now pure info entities (no credentials).
 */
@Repository
public interface TeamRepository extends JpaRepository<TeamEntity, String> {

    Optional<TeamEntity> findByName(String name);

    boolean existsByName(String name);

    boolean existsByIpAddress(String ipAddress);

    @Query("SELECT t FROM TeamEntity t LEFT JOIN FETCH t.members WHERE t.id = :id")
    Optional<TeamEntity> findByIdWithMembers(String id);

    @Query("SELECT t FROM TeamEntity t WHERE SIZE(t.members) > 0")
    List<TeamEntity> findTeamsWithMembers();
}
