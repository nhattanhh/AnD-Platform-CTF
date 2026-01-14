package com.tool.atkdefbackend.service.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tool.atkdefbackend.entity.UserEntity;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Getter
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private final Integer id;
    private final String username;
    private final String displayName;
    private final String teamId;
    private final String teamName;

    @JsonIgnore
    private final String password;

    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Integer id, String username, String displayName, 
            String teamId, String teamName, String password,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.teamId = teamId;
        this.teamName = teamName;
        this.password = password;
        this.authorities = authorities;
    }

    /**
     * Build UserDetails from UserEntity
     * User's role field is used for authorization (ADMIN, TEACHER, or STUDENT)
     */
    public static UserDetailsImpl build(UserEntity user) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                user.getTeamId(),
                user.getTeamName(),
                user.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public boolean hasTeam() {
        return teamId != null;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof UserDetailsImpl))
            return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
