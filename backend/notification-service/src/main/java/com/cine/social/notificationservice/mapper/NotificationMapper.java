package com.cine.social.notificationservice.mapper;

import com.cine.social.event.NotificationEvent;
import com.cine.social.notificationservice.dto.response.NotificationResponse;
import com.cine.social.notificationservice.enitty.Notification;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    Notification toEntity(NotificationEvent event);
    NotificationResponse toResponse(Notification entity);
    List<NotificationResponse> toListResponses(List<Notification> entities);
}
