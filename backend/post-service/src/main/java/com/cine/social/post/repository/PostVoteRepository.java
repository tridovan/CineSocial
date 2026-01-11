package com.cine.social.post.repository;


import com.cine.social.post.entity.Post;
import com.cine.social.post.entity.PostVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostVoteRepository extends JpaRepository<PostVote, String> {
    Optional<PostVote> findByUserIdAndPost(String userId, Post post);

    @Query("SELECT pv FROM PostVote pv WHERE pv.userId = :userId AND pv.post.id IN :postIds")
    List<PostVote> findAllByUserIdAndPostIds(@Param("userId") String userId, @Param("postIds") List<String> postIds);
}