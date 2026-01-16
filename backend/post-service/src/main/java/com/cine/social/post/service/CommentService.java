package com.cine.social.post.service;



import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.post.dto.request.CommentRequest;
import com.cine.social.post.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {
    CommentResponse createComment(String postId, CommentRequest request);

    PageResponse<List<CommentResponse>> getCommentsByPostId(String postId, int page, int size);

    PageResponse<List<CommentResponse>> getReplies(String commentId, int page, int size);

    void deleteComment(String commentId);

    void updateComment(String id, String content);

    void voteComment(String commentId, int value);
}
