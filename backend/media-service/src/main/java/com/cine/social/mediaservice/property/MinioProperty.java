package com.cine.social.mediaservice.property;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "minio")
@Component
@Setter
@Getter
public class MinioProperty {
    private String url;
    private String accessKey;
    private String secretKey;
    private String bucket;
}
