package com.backend.backend.service;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(String message, Notification.Type type, User.Role targetRole,
            Long relatedEntityId) {
        Notification notification = Notification.builder()
                .message(message)
                .type(type)
                .targetRole(targetRole)
                .relatedEntityId(relatedEntityId)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForRole(User.Role role) {
        return notificationRepository.findByTargetRoleAndRead(role, false);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAsReadByRelatedEntity(Long relatedEntityId, Notification.Type type) {
        notificationRepository.findByRelatedEntityIdAndType(relatedEntityId, type).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
