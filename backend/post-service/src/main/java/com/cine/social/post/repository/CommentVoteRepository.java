package com.cine.social.post.repository;


import com.cine.social.post.entity.Comment;
import com.cine.social.post.entity.CommentVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentVoteRepository extends JpaRepository<CommentVote, String> {
    Optional<CommentVote> findByUserIdAndComment(String userId, Comment comment);

    @Query("SELECT cv FROM CommentVote cv WHERE cv.userId = :userId AND cv.comment.id IN :commentIds")
    List<CommentVote> findAllByUserIdAndCommentIds(@Param("userId") String userId, @Param("commentIds") List<String> commentIds);
}