package com.cine.social.post.httpclient;

import com.cine.social.common.configuration.AuthenticationRequestInterceptor;
import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.post.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service", url = "${app.services.identity-service.url}",
    configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityClient {

    @GetMapping("/users/{id}")
    ApiResponse<UserResponse> getProfile(@PathVariable String id);

}
