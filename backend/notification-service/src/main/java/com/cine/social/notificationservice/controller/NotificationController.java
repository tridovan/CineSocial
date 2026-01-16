package com.cine.social.notificationservice.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.notificationservice.dto.response.NotificationResponse;
import com.cine.social.notificationservice.service.NotificationService;
import com.cine.social.notificationservice.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SseService sseService;
    private final NotificationService notificationService;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return sseService.subscribe();
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications() {
        return ApiResponse.success(notificationService.getNotifications());
    }

    @PatchMapping("/{id}")
    public ApiResponse<String> isRead(@PathVariable String id) {
        notificationService.setRead(id);
        return ApiResponse.successWithMessage("Update successfully");
    }
}