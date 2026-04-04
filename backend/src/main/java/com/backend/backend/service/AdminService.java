package com.backend.backend.service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<User> getPendingAlumni(String requesterRole, String department) {
        if ("ROLE_SUPER_ADMIN".equals(requesterRole)) {
            return userRepository.findByStatus(User.Status.PENDING);
        }
        // Department Admins only see pending Alumni from their own department
        if (department != null && !department.isEmpty()) {
            return userRepository.findByStatusAndRoleAndDepartment(User.Status.PENDING, User.Role.ROLE_ALUMNI, department);
        }
        return userRepository.findByStatusAndRole(User.Status.PENDING, User.Role.ROLE_ALUMNI);
    }

    public User approveAlumni(Long id, String requesterRole, String adminDept) {
        User user = userRepository.findById(id).orElseThrow();

        // 1. Security check: ROLE_ADMIN cannot approve other roles
        if ("ROLE_ADMIN".equals(requesterRole) && user.getRole() != User.Role.ROLE_ALUMNI) {
            throw new RuntimeException("Admins can only approve alumni accounts.");
        }

        // 2. Department check: ROLE_ADMIN can only approve their own department
        if ("ROLE_ADMIN".equals(requesterRole) && adminDept != null && !adminDept.equals(user.getDepartment())) {
            throw new RuntimeException("You are not authorized to approve alumni from other departments.");
        }

        user.setStatus(User.Status.APPROVED);
        User saved = userRepository.save(user);

        // Mark notification as read
        notificationService.markAsReadByRelatedEntity(id,
                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL);

        return saved;
    }

    public User rejectAlumni(Long id, String requesterRole, String adminDept) {
        User user = userRepository.findById(id).orElseThrow();

        // 1. Security check: Only ROLE_ALUMNI can be rejected by standard admins
        if ("ROLE_ADMIN".equals(requesterRole) && user.getRole() != User.Role.ROLE_ALUMNI) {
            throw new RuntimeException("Admins can only manage alumni accounts.");
        }

        // 2. Department check
        if ("ROLE_ADMIN".equals(requesterRole) && adminDept != null && !adminDept.equals(user.getDepartment())) {
            throw new RuntimeException("Authorization error: Department mismatch.");
        }

        user.setStatus(User.Status.REJECTED);
        User saved = userRepository.save(user);

        // Mark notification as read
        notificationService.markAsReadByRelatedEntity(id,
                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL);

        return saved;
    }

    public byte[] exportAlumniToExcel(String department) throws IOException {
        List<User> alumni;
        if (department != null && !department.isEmpty()) {
            alumni = userRepository.findByRoleAndDepartment(User.Role.ROLE_ALUMNI, department);
        } else {
            alumni = userRepository.findByRole(User.Role.ROLE_ALUMNI);
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Alumni");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Name", "Batch", "Degree", "Company", "Designation", "Location", "Tech Stack", "Email",
                    "LinkedIn" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Data
            int rowIdx = 1;
            for (User user : alumni) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(user.getName());
                row.createCell(1).setCellValue(user.getBatch() != null ? user.getBatch().toString() : "");
                row.createCell(2).setCellValue(user.getDegree());
                row.createCell(3).setCellValue(user.getCompany());
                row.createCell(4).setCellValue(user.getDesignation());
                row.createCell(5).setCellValue(user.getLocation());
                row.createCell(6).setCellValue(user.getTechStack());
                row.createCell(7).setCellValue(user.getEmail());
                row.createCell(8).setCellValue(user.getLinkedinUrl());
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    public void deleteUser(Long id, String requesterRole, String adminDept) {
        User user = userRepository.findById(id).orElseThrow();

        // 1. Role Check
        if ("ROLE_ADMIN".equals(requesterRole) && user.getRole() != User.Role.ROLE_ALUMNI) {
            throw new RuntimeException("Admins can only delete alumni accounts.");
        }

        // 2. Department Check
        if ("ROLE_ADMIN".equals(requesterRole) && adminDept != null && !adminDept.equals(user.getDepartment())) {
            throw new RuntimeException("You do not have permission to delete users from this department.");
        }

        userRepository.deleteById(id);
    }
}
