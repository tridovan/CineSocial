package com.cine.social.identity.configuration;

import com.cine.social.identity.constant.PredefinedRole;
import com.cine.social.identity.entity.Role;
import com.cine.social.identity.entity.User;
import com.cine.social.identity.repository.RoleRepository;
import com.cine.social.identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    static String ADMIN_EMAIL = "admin123@gmail.com";
    static String ADMIN_PASSWORD = "admin123";


    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository,
                                        RoleRepository roleRepository) {

        log.info("Initializing application for default user and roles...");

        return args -> {
            initAdminUser(userRepository, roleRepository);
            log.info("Application initialization completed.");
        };
    }

    private void initAdminUser(UserRepository userRepository, RoleRepository roleRepository) {
        if (userRepository.findByEmail(ADMIN_EMAIL).isEmpty()) {
            log.info("Admin user not found, creating default roles and admin user...");

            Role adminRole = roleRepository.findById(PredefinedRole.ADMIN_ROLE)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name(PredefinedRole.ADMIN_ROLE)
                            .description("Admin role")
                            .build()));

            Role userRole = roleRepository.findById(PredefinedRole.USER_ROLE)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name(PredefinedRole.USER_ROLE)
                            .description("User role")
                            .build()));

            User adminUser = User.builder()
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .firstName("Admin")
                    .lastName("System")
                    .roles(Set.of(adminRole, userRole))
                    .build();

            userRepository.save(adminUser);
            log.warn("Default admin user '{}' has been created with password '{}'. Please change it immediately!", ADMIN_EMAIL, ADMIN_PASSWORD);
        }
    }
}