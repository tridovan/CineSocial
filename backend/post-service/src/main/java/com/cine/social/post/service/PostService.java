package com.cine.social.post.service;



import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.post.dto.request.PostCreationRequest;
import com.cine.social.post.dto.request.PostUpdateRequest;
import com.cine.social.post.dto.response.PostResponse;

import java.util.List;

public interface PostService {

    PostResponse createPost(PostCreationRequest request);
    void updatePost(String id, PostUpdateRequest request);

    void deletePost(String postId);

    void votePost(String postId, int value);

    PageResponse<List<PostResponse>> getMyPosts(int page, int size);

    PageResponse<List<PostResponse>> getPosts(int page, int size);

    void retryPost(String postId);

    PageResponse<List<PostResponse>> getMyFeed(int page, int size);

    PageResponse<List<PostResponse>> getReels(int page, int size);
}
