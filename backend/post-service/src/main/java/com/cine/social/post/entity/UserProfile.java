package com.cine.social.post.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String imgUrl;
}