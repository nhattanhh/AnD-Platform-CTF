package com.tool.atkdefbackend.repository;

import com.tool.atkdefbackend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM UserEntity u WHERE u.team.id = :teamId")
    List<UserEntity> findByTeamId(String teamId);

    List<UserEntity> findByRole(String role);

    @Query("SELECT u FROM UserEntity u WHERE u.team IS NULL")
    List<UserEntity> findUsersWithoutTeam();

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.team WHERE u.id = :id")
    Optional<UserEntity> findByIdWithTeam(Integer id);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.team WHERE u.username = :username")
    Optional<UserEntity> findByUsernameWithTeam(String username);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.team")
    List<UserEntity> findAllWithTeams();

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.team WHERE u.team.id = :teamId")
    List<UserEntity> findByTeamIdWithTeam(String teamId);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.team WHERE u.role = :role")
    List<UserEntity> findByRoleWithTeam(String role);
}
