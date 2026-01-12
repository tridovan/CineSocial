package com.cine.social.post.repository;

import com.cine.social.post.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {

    @Query(
        value = "SELECT DISTINCT c FROM Comment c LEFT JOIN FETCH c.authorProfile LEFT JOIN FETCH c.replyToUserProfile WHERE c.post.id = :postId AND c.parent IS NULL",
        countQuery = "SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId AND c.parent IS NULL"
    )
    Page<Comment> findRootCommentsByPostId(@Param("postId") String postId, Pageable pageable);

    @Query(
        value = "SELECT DISTINCT c FROM Comment c LEFT JOIN FETCH c.authorProfile LEFT JOIN FETCH c.replyToUserProfile WHERE c.parent.id = :parentId",
        countQuery = "SELECT COUNT(c) FROM Comment c WHERE c.parent.id = :parentId"
    )
    Page<Comment> findRepliesByParentId(@Param("parentId") String parentId, Pageable pageable);
}
