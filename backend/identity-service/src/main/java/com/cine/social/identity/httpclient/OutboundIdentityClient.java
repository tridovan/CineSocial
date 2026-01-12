package com.cine.social.identity.httpclient;

import com.cine.social.common.configuration.AuthenticationRequestInterceptor;
import com.cine.social.identity.dto.request.ExchangeTokenRequest;
import com.cine.social.identity.dto.response.ExchangeTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "outbound-identity", url = "https://oauth2.googleapis.com",
    configuration = {AuthenticationRequestInterceptor.class})
public interface OutboundIdentityClient {
    @PostMapping(value = "/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    ExchangeTokenResponse exchangeToken(@QueryMap ExchangeTokenRequest request);
}
