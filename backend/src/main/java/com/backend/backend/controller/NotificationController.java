package com.backend.backend.controller;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        String roleStr = auth.getAuthorities().iterator().next().getAuthority();
        User.Role role = User.Role.valueOf(roleStr);
        return ResponseEntity.ok(notificationService.getNotificationsForRole(role));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
