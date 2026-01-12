package com.cine.social.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbox_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String aggregateType;
    private String aggregateId;
    private String type;
    @Column(columnDefinition = "json")
    private String payload;

    @CreationTimestamp
    private LocalDateTime createdAt;
}