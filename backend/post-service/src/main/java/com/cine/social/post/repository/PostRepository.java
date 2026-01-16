package com.cine.social.post.repository;


import com.cine.social.post.constant.PostStatus;
import com.cine.social.post.constant.ResourceType;
import com.cine.social.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    @EntityGraph(attributePaths = {"userProfile"})
    Page<Post> findAllByUserId(String userId, Pageable pageable);
    @EntityGraph(attributePaths = {"userProfile"})
    Page<Post> findAllByStatus(PostStatus status, Pageable pageable);

    @Query(value = "SELECT p FROM Post p " +
            "JOIN UserFollow uf ON p.userId = uf.followedId " + 
            "WHERE uf.followerId = :currentUserId ",
        countQuery = "SELECT count(p) FROM Post p " +
        "JOIN UserFollow uf ON p.userId = uf.followedId " +
        "WHERE uf.followerId = :currentUserId")
    Page<Post> findFeedByUserId(@Param("currentUserId") String currentUserId, Pageable pageable);

    @EntityGraph(attributePaths = {"userProfile"})
    Page<Post> findAllByStatusAndResourceType(PostStatus status, ResourceType resourceType, Pageable pageable);

    @EntityGraph(attributePaths = {"userProfile"})
    Page<Post> findAllByUserIdAndStatus(String userId, PostStatus status, Pageable pageable);
}
