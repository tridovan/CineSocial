package com.cine.social.notificationservice.service.impl;

import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.notificationservice.dto.response.NotificationResponse;
import com.cine.social.notificationservice.enitty.Notification;
import com.cine.social.notificationservice.mapper.NotificationMapper;
import com.cine.social.notificationservice.repository.NotificationRepository;
import com.cine.social.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public List<NotificationResponse> getNotifications() {
        String currentUserId = SecurityUtils.getCurrentUserId();
        List<Notification> entities = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId);
        return notificationMapper.toListResponses(entities);
    }

    @Override
    public void setRead(String id) {
        Optional<Notification> optional = notificationRepository.findById(id);
        if(optional.isEmpty())
            return;
        optional.get().setSeen(true);
    }
}
