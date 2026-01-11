package com.cine.social.post.service.impl;

import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.utils.PageHelper;
import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.event.PostCreatedEvent;
import com.cine.social.post.constant.PostErrorCode;
import com.cine.social.post.constant.PostStatus;
import com.cine.social.post.constant.ResourceType;
import com.cine.social.post.controller.PostController;
import com.cine.social.post.dto.request.PostCreationRequest;
import com.cine.social.post.dto.request.PostUpdateRequest;
import com.cine.social.post.dto.response.PostResponse;
import com.cine.social.post.entity.Post;
import com.cine.social.post.entity.PostVote;
import com.cine.social.post.mapper.PostMapper;
import com.cine.social.post.repository.PostRepository;
import com.cine.social.post.repository.PostVoteRepository;
import com.cine.social.post.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final PostVoteRepository postVoteRepository;
    private final KafkaTemplate<String, PostCreatedEvent> kafkaTemplate;
    private final static String POST_TOPIC = "post-created-topic";

    @Override
    @Transactional
    public void votePost(String postId, int value) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        Post post = findPostByIdOrThrowException(postId);

        if (value != 1 && value != -1 && value != 0) {
            throw new AppException(PostErrorCode.INVALID_VOTE_VALUE);
        }

        Optional<PostVote> existingVoteOpt = postVoteRepository.findByUserIdAndPost(currentUserId, post);
        int currentVoteCount = post.getVoteCount();

        if (existingVoteOpt.isPresent()) {
            PostVote existingVote = existingVoteOpt.get();
            int oldValue = existingVote.getValue();

            if (value == 0) {
                postVoteRepository.delete(existingVote);
                post.setVoteCount(currentVoteCount - oldValue);
            } else if (oldValue != value) {
                existingVote.setValue(value);
                postVoteRepository.save(existingVote);
                post.setVoteCount(currentVoteCount - oldValue + value);
            }
        } else {
            if (value != 0) {
                PostVote newVote = PostVote.builder()
                        .userId(currentUserId)
                        .post(post)
                        .value(value)
                        .build();
                postVoteRepository.save(newVote);
                post.setVoteCount(currentVoteCount + value);
            }
        }

        postRepository.save(post);
    }

    @Override
    public PageResponse<List<PostResponse>> getMyPosts(int page, int size) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageHelper.pageEngine(page, size, "createdAt:desc");
        Page<Post> postsPage = postRepository.findAllByUserId(currentUserId, pageable);
        return buildPostPageResponse(postsPage, page, size, currentUserId);
    }

    @Override
    public PageResponse<List<PostResponse>> getPosts(int page, int size) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageHelper.pageEngine(page, size, "createdAt:desc");
        Page<Post> postsPage = postRepository.findAllByStatus(PostStatus.PUBLISHED, pageable);
        return buildPostPageResponse(postsPage, page, size, currentUserId);
    }

    @Override
    @Transactional
    public PostResponse createPost(PostCreationRequest request) {
        validateResourceIntegrity(request);

        String currentUserId = SecurityUtils.getCurrentUserId();
        ResourceType type = ResourceType.valueOf(request.getResourceType());

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .resourceUrl(request.getResourceUrl())
                .resourceType(type)
                .userId(currentUserId)
                .build();

        if (ResourceType.VIDEO.equals(type)) {
            post.setStatus(PostStatus.PENDING_MEDIA);
        } else {
            post.setStatus(PostStatus.PUBLISHED);
        }

        Post savedPost = postRepository.save(post);
        if (ResourceType.VIDEO.equals(type)) {
            PostCreatedEvent event = PostCreatedEvent.builder()
                    .postId(savedPost.getId())
                    .resourceUrl(savedPost.getResourceUrl())
                    .build();
            kafkaTemplate.send(POST_TOPIC, event);
            log.info("Sending event {} to topic {}", event.getPostId(), POST_TOPIC);
        }

        return postMapper.toResponse(savedPost);
    }
    

    @Override
    public void updatePost(String id, PostUpdateRequest request) {
        Post post = findPostByIdOrThrowException(id);
        postMapper.updatePost(post, request);
        postRepository.save(post);

    }

    @Override
    public void deletePost(String postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new AppException(PostErrorCode.POST_NOT_FOUND));
        postRepository.delete(post);
    }

    
    private Post findPostByIdOrThrowException(String postId){
        return postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.POST_NOT_FOUND));
    }

    private PageResponse<List<PostResponse>> buildPostPageResponse(Page<Post> postsPage, int page, int size, String currentUserId) {
        List<Post> posts = postsPage.getContent();

        Map<String, Integer> userVotesMap = new HashMap<>();
        if (currentUserId != null && !posts.isEmpty()) {
            List<String> postIds = posts.stream().map(Post::getId).toList();
            List<PostVote> votes = postVoteRepository.findAllByUserIdAndPostIds(currentUserId, postIds);

            for (PostVote v : votes) {
                userVotesMap.put(v.getPost().getId(), v.getValue());
            }
        }

        List<PostResponse> responseItems = posts.stream().map(post -> {
            PostResponse res = postMapper.toResponse(post);
            res.setUserVoteValue(userVotesMap.getOrDefault(post.getId(), 0));
            return res;
        }).toList();

        return PageResponse.<List<PostResponse>>builder()
                .pageNo(page)
                .pageSize(size)
                .totalPage(postsPage.getTotalPages())
                .totalElement(postsPage.getTotalElements())
                .items(responseItems)
                .build();
    }

    private void validateResourceIntegrity(PostCreationRequest request) {
        if (Objects.isNull(request.getResourceType())) {
            throw new AppException(PostErrorCode.INVALID_RESOURCE_DATA);
        }

        ResourceType type;
        try {
            type = ResourceType.valueOf(request.getResourceType());
        } catch (IllegalArgumentException e) {
            throw new AppException(PostErrorCode.INVALID_RESOURCE_DATA);
        }

        String url = request.getResourceUrl();
        boolean hasUrl = StringUtils.hasText(url);

        if ((ResourceType.VIDEO.equals(type) || ResourceType.IMAGE.equals(type)) && !hasUrl) {
            throw new AppException(PostErrorCode.INVALID_RESOURCE_DATA);
        }

        if (ResourceType.NONE.equals(type) && hasUrl) {
            throw new AppException(PostErrorCode.INVALID_RESOURCE_DATA);
        }
    }

}
