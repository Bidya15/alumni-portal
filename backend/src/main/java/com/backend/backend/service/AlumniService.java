package com.backend.backend.service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumniService {

        private final UserRepository userRepository;

        public List<User> searchAlumni(String city, String company, String techStack, Integer batch, String department) {
                return userRepository.findAll().stream()
                                .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI
                                                && u.getStatus() == User.Status.APPROVED)
                                .filter(u -> department == null 
                                                || (u.getDepartment() != null && u.getDepartment().equals(department)))
                                .filter(u -> city == null
                                                || (u.getLocation() != null && u.getLocation().toLowerCase()
                                                                .contains(city.toLowerCase())))
                                .filter(u -> company == null
                                                || (u.getCompany() != null && u.getCompany().toLowerCase()
                                                                .contains(company.toLowerCase())))
                                .filter(u -> techStack == null || (u.getTechStack() != null
                                                && u.getTechStack().toLowerCase().contains(techStack.toLowerCase())))
                                .filter(u -> batch == null || (u.getBatch() != null && u.getBatch().equals(batch)))
                                .collect(Collectors.toList());
        }

        public User updateProfile(Long id, User update) {
                User user = userRepository.findById(id).orElseThrow();
                user.setCompany(update.getCompany());
                user.setDesignation(update.getDesignation());
                user.setLocation(update.getLocation());
                user.setTechStack(update.getTechStack());
                user.setLinkedinUrl(update.getLinkedinUrl());
                user.setBio(update.getBio());
                user.setDepartment(update.getDepartment());
                user.setProfileImage(update.getProfileImage());
                return userRepository.save(user);
        }
}
