package com.cine.social.post.repository;


import com.cine.social.post.constant.PostStatus;
import com.cine.social.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    @EntityGraph(attributePaths = {"userProfile"})
    Page<Post> findAllByUserId(String userId, Pageable pageable);
    @EntityGraph(attributePaths = {"userProfile"})
    Page<Post> findAllByStatus(PostStatus status, Pageable pageable);
}
