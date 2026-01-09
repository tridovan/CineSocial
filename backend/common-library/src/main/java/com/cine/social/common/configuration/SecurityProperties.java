package com.cine.social.common.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.security")
@Getter
@Setter
public class SecurityProperties {
    private List<String> publicPostEndpoints = new ArrayList<>();
    private List<String> publicGetEndpoints = new ArrayList<>();
}