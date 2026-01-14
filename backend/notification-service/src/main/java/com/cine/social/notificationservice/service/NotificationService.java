package com.cine.social.notificationservice.service;

import com.cine.social.notificationservice.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotifications();

    void setRead(String id);
}
