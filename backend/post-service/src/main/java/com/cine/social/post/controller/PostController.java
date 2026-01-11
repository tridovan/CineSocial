package com.cine.social.post.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.post.dto.request.CommentRequest;
import com.cine.social.post.dto.request.PostCreationRequest;
import com.cine.social.post.dto.request.PostUpdateRequest;
import com.cine.social.post.dto.response.CommentResponse;
import com.cine.social.post.dto.response.PostResponse;
import com.cine.social.post.service.CommentService;
import com.cine.social.post.service.PostService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final CommentService commentService;

    @PostMapping
    public ApiResponse<PostResponse> createPost(@RequestBody PostCreationRequest request) {

        return ApiResponse.success(postService.createPost(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<List<PostResponse>>>getPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ApiResponse.success(postService.getPosts(page, size));
    }

    @GetMapping("/my-posts")
    public ApiResponse<PageResponse<List<PostResponse>>>getMyPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(postService.getMyPosts(page, size));
    }


    @PutMapping("/{postId}")
    public ApiResponse<String> updatePost(@PathVariable String postId, @RequestBody PostUpdateRequest request) {
        postService.updatePost(postId, request);
        return ApiResponse.success("Update Post successfully");
    }

    @PostMapping(value = "/{postId}/comments")
    public ApiResponse<CommentResponse> createComment(@PathVariable String postId,
                                                      @RequestBody CommentRequest request) {
        return ApiResponse.success(commentService.createComment(postId, request));
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<String> deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
        return ApiResponse.success("Delete Post successfully");
    }

    @GetMapping("/{postId}/comments")
    public ApiResponse<PageResponse<List<CommentResponse>>> getCommentsOfPost(
            @PathVariable String postId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(commentService.getCommentsByPostId(postId, page, size));
    }

    @PostMapping("/{postId}/vote")
    public ApiResponse<String> votePost(@PathVariable String postId, @RequestParam int value) {
        postService.votePost(postId, value);
        return ApiResponse.success("Vote Post successfully");
    }
}