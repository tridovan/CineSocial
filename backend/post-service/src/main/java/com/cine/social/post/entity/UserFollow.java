package com.cine.social.post.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "user_follows", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "followed_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFollow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "follower_id", nullable = false)
    private String followerId;

    @Column(name = "followed_id", nullable = false)
    private String followedId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}