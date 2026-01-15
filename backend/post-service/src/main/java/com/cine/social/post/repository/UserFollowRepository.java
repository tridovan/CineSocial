package com.cine.social.post.repository;

import com.cine.social.post.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, String> {
    Optional<UserFollow> findByFollowerIdAndFollowedId(String followerId, String followedId);
    void deleteByFollowerIdAndFollowedId(String followerId, String followedId);
}
