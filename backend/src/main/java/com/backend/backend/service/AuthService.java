package com.backend.backend.service;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.LoginRequest;
import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final NotificationService notificationService;
        private final EmailService emailService;
        private final OtpService otpService;

        public AuthResponse generateAuthResponse(User user) {
                var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                Collections.emptyList()));

                return mapUserToResponse(user, jwtToken);
        }

        private AuthResponse mapUserToResponse(User user, String token) {
                return AuthResponse.builder()
                                .id(user.getId())
                                .token(token)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .status(user.getStatus().name())
                                .batch(user.getBatch())
                                .degree(user.getDegree())
                                .company(user.getCompany())
                                .designation(user.getDesignation())
                                .location(user.getLocation())
                                .techStack(user.getTechStack())
                                .linkedinUrl(user.getLinkedinUrl())
                                .bio(user.getBio())
                                .profileImage(user.getProfileImage())
                                .build();
        }

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already registered");
                }

                // Enforce Alumni role for all public registrations.
                // Department Admins must be explicitly assigned by Super Admin.
                User.Role role = User.Role.ROLE_ALUMNI;

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .batch(request.getBatch())
                                .degree(request.getDegree())
                                .company(request.getCompany())
                                .designation(request.getDesignation())
                                .location(request.getLocation())
                                .techStack(request.getTechStack())
                                .linkedinUrl(request.getLinkedinUrl())
                                .status(User.Status.PENDING)
                                .build();

                userRepository.save(user);

                // Create Notification & Send Emails for Alumni
                notificationService.createNotification(
                                "New Alumni registration: " + user.getName(),
                                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL,
                                User.Role.ROLE_ADMIN,
                                user.getId());

                // Notify Department Admins via Email
                List<User> admins = userRepository.findByRole(User.Role.ROLE_ADMIN);
                for (User admin : admins) {
                        emailService.sendApprovalNotification(admin.getEmail(), user.getName(), "Alumni");
                }

                return generateAuthResponse(user);
        }

        public AuthResponse initiateLogin(LoginRequest request) {
                // Step 1: Verify Password
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                
                // Step 2: Send OTP
                otpService.generateAndSendOtp(request.getEmail());
                
                // Return a partial response indicating OTP is sent
                return AuthResponse.builder()
                                .email(request.getEmail())
                                .status("OTP_REQUIRED")
                                .build();
        }

        public AuthResponse completeLogin(String email, String otp) {
                // Step 3: Verify OTP
                if (!otpService.verifyOtp(email, otp)) {
                        throw new RuntimeException("Invalid or expired OTP");
                }

                // Step 4: Finalize Login and Issue Token
                var user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return generateAuthResponse(user);
        }

        public AuthResponse login(LoginRequest request) {
                // Keep the old login for backward compatibility or direct usage if needed, 
                // but we will mainly use initiateLogin + completeLogin in the UI.
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();

                return generateAuthResponse(user);
        }

        public void changePassword(String email, String oldPassword, String newPassword) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                        throw new RuntimeException("Invalid current password");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }

        public void forgotPassword(String email) {
                if (userRepository.findByEmail(email).isEmpty()) {
                        throw new RuntimeException("Account with this email does not exist");
                }
                otpService.generateAndSendResetOtp(email);
        }

        public void sendOtpForRegisteredUser(String email) {
                if (userRepository.findByEmail(email).isEmpty()) {
                        throw new RuntimeException("Account with this email does not exist");
                }
                otpService.generateAndSendOtp(email);
        }

        public void resetPassword(String email, String otp, String newPassword) {
                if (!otpService.verifyOtp(email, otp)) {
                        throw new RuntimeException("Invalid or expired OTP");
                }
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }
}
