package com.cine.social.post.repository;


import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.post.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    @Modifying
    @Transactional
    @Query("UPDATE UserProfile u SET u.firstName = :#{#e.firstName}, u.lastName = :#{#e.lastName}, u.imageUrl = :#{#e.imageUrl} WHERE u.id = :#{#e.userId}")
    int updateProfileIfExists(@Param("e") ProfileUpdatedEvent event);
}