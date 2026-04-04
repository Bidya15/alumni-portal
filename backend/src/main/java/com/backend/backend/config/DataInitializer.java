package com.backend.backend.config;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.findByEmail("superadmin@college.edu").isEmpty()) {
                        User superAdmin = User.builder()
                                        .name("Super Admin")
                                        .email("superadmin@college.edu")
                                        .password(passwordEncoder.encode("SuperAdmin@123"))
                                        .role(User.Role.ROLE_SUPER_ADMIN)
                                        .status(User.Status.APPROVED)
                                        .build();
                        userRepository.save(superAdmin);
                }
        }
}
