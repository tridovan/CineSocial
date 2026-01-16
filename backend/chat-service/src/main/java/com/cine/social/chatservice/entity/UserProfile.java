package com.cine.social.chatservice.entity;


import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_profiles")
@Data
@Builder
public class UserProfile {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String imageUrl;
}
