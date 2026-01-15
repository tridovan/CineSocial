package com.cine.social.identity.repository;

import com.cine.social.identity.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, String> {
    boolean existsByFollowerIdAndFollowedId(String followerId, String followedId);
    Optional<UserFollow> findByFollowerIdAndFollowedId(String followerId, String followedId);
    List<UserFollow> findAllByFollowerId(String followerId);
}
