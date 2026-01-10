package com.cine.social.gateway.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@ConfigurationProperties(prefix = "app.security")
public class PublicEndpointProperties {
    private List<String> publicPostEndpoints = new ArrayList<>();
    private List<String> publicGetEndpoints = new ArrayList<>();
}