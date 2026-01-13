package com.cine.social.chatservice.httpclient;

import com.cine.social.chatservice.configuration.ChatServiceFeignConfig;
import com.cine.social.chatservice.dto.response.UserResponse;
import com.cine.social.common.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "identity-service", url = "${app.services.identity-service.url}",
    configuration = {ChatServiceFeignConfig.class})
public interface IdentityClient {

    @GetMapping("/users/{id}")
    ApiResponse<UserResponse> getProfile(@PathVariable String id);


    @PostMapping("/internal/users/fetch")
    ApiResponse<List<UserResponse>> getBatchUsersInfo(@RequestBody List<String> ids);

}
