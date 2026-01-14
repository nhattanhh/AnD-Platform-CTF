package com.tool.atkdefbackend.service.auth;

import com.tool.atkdefbackend.entity.UserEntity;
import com.tool.atkdefbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsernameWithTeam(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return UserDetailsImpl.build(user);
    }
}
