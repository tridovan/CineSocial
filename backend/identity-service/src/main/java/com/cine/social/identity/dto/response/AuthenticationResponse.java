package com.cine.social.identity.dto.response;

import com.cine.social.identity.entity.Role;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;


@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class AuthenticationResponse {

    String token;
    boolean authenticated;
    List<String> roles;


    public static AuthenticationResponse build(String token, boolean authenticated, Set<Role> roles){
         return AuthenticationResponse.builder()
                    .token(token)
                    .authenticated(authenticated)
                    .roles(roles.stream().map(role -> role.getName()).toList()).build();

    };

}
