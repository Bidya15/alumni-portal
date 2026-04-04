package com.backend.backend.service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createAdmin(User admin) {
        // Deprecated: We now promote existing alumni instead of manual creation
        admin.setRole(User.Role.ROLE_ADMIN);
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setStatus(User.Status.APPROVED);
        return userRepository.save(admin);
    }

    public User assignAdminRole(Long userId, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(User.Role.ROLE_ADMIN);
        user.setDepartment(department);
        user.setStatus(User.Status.APPROVED); // Ensure they are approved if they are admins
        return userRepository.save(user);
    }

    public void revokeAdminRole(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() == User.Role.ROLE_ADMIN || user.getRole() == User.Role.ROLE_SUPER_ADMIN) {
            user.setRole(User.Role.ROLE_ALUMNI);
            user.setDepartment(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Cannot revoke role from non-admin user");
        }
    }

    public void promoteToSuperAdmin(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() == User.Role.ROLE_ADMIN) {
            user.setRole(User.Role.ROLE_SUPER_ADMIN);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Only Admins can be promoted to Super Admin");
        }
    }

    public User updateUserDepartment(Long id, String newDepartment) {
        User user = userRepository.findById(id).orElseThrow();
        user.setDepartment(newDepartment);
        return userRepository.save(user);
    }

    public List<User> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ROLE_ADMIN || u.getRole() == User.Role.ROLE_SUPER_ADMIN)
                .toList();
    }
}
