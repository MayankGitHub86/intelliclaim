package com.intelliclaim.workflow.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/api/v1/notifications/broadcast")
    public void broadcastNotification(@RequestBody NotificationMessage message) {
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
}

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
class NotificationMessage {
    private String type;
    private Object payload;
}
