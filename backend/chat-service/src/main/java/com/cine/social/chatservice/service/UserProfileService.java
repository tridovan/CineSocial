package com.cine.social.chatservice.service;

import java.util.List;

public interface UserProfileService {
    void ensureUserProfilesExists(List<String> userIds);
}
