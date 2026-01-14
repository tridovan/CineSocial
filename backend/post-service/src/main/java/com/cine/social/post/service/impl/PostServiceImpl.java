package com.cine.social.post.service.impl;

import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.exception.CommonErrorCode;
import com.cine.social.common.utils.PageHelper;
import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.event.MinioFileDeletionEvent;
import com.cine.social.event.NotificationEvent;
import com.cine.social.event.PostCreatedEvent;
import com.cine.social.event.PostOutboxEvent;
import com.cine.social.post.constant.PostErrorCode;
import com.cine.social.post.constant.PostStatus;
import com.cine.social.post.constant.ResourceType;
import com.cine.social.post.controller.PostController;
import com.cine.social.post.dto.request.PostCreationRequest;
import com.cine.social.post.dto.request.PostUpdateRequest;
import com.cine.social.post.dto.response.PostResponse;
import com.cine.social.post.entity.OutboxEvent;
import com.cine.social.post.entity.Post;
import com.cine.social.post.entity.PostVote;
import com.cine.social.post.entity.UserProfile;
import com.cine.social.post.mapper.PostMapper;
import com.cine.social.post.repository.OutboxEventRepository;
import com.cine.social.post.repository.PostRepository;
import com.cine.social.post.repository.PostVoteRepository;
import com.cine.social.post.repository.UserProfileRepository;
import com.cine.social.post.service.PostService;
import com.cine.social.post.service.UserProfileService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserProfileService userProfileService;
    private final NotificationProducer notificationProducer;
    private final UserProfileRepository userProfileRepository;
    private final ObjectMapper objectMapper;
    private final OutboxEventRepository outboxEventRepository;
    private final static String POST_TOPIC = "post-created-topic";
    private final static String FILE_DELETION_TOPIC = "file-deletion-topic";

    @Override
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

                if (!post.getUserId().equals(currentUserId)) {
                    notificationProducer.createAndSendingNotificationEvent(
                            currentUserId,
                            post.getId(),
                            "VOTE_POST",
                            "vote your post"
                    );
                }
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

        userProfileService.ensureUserProfileExists(currentUserId);

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

        Post savedPost = postRepository.saveAndFlush(post);
        if (ResourceType.VIDEO.equals(type)) {
            createAndSendEvent(savedPost.getId(), savedPost.getResourceUrl());
        }

        createOutBoxEvent(savedPost.getId(), savedPost, currentUserId, "UPSERT_POST");


        return postMapper.toResponse(savedPost);
    }


    @Override
    public void retryPost(String postId) {
        Post post = findPostByIdOrThrowException(postId);
        String currentUserId = SecurityUtils.getCurrentUserId();
        if(!post.getUserId().equals(currentUserId)){
            throw new AppException(PostErrorCode.UNAUTHORIZED);
        }
        if(!post.getResourceType().equals(ResourceType.VIDEO)){
            throw new AppException(PostErrorCode.INVALID_RESOURCE_DATA);
        }

        post.setStatus(PostStatus.PENDING_MEDIA);
        postRepository.save(post);

        createAndSendEvent(post.getId(), post.getResourceUrl());
    }


    private void createAndSendEvent(String postId, String resourceUrl){
        PostCreatedEvent event = PostCreatedEvent.builder()
                .postId(postId)
                .resourceUrl(resourceUrl)
                .build();
        kafkaTemplate.send(POST_TOPIC, event);
        log.info("Sending event {} to topic {}", event.getPostId(), POST_TOPIC);

    }
    

    @Override
    @Transactional
    public void updatePost(String id, PostUpdateRequest request) {
        Post post = findPostByIdOrThrowException(id);
        postMapper.updatePost(post, request);
        postRepository.save(post);
        createOutBoxEvent(id, post, post.getUserId(), "UPSERT_POST");

    }

    @Override
    @Transactional
    public void deletePost(String postId) {
        Post post = findPostByIdOrThrowException(postId);
        postRepository.delete(post);
        deleteFileIfResourcePresent(post);
        createOutBoxEvent(postId, null, null, "DELETE_POST");

    }
    private void createOutBoxEvent(String postId, Post post, String userId, String eventType){
        PostOutboxEvent postOutboxEvent;
        if(Objects.nonNull(post)) {
            String userFullName = "Cine Social";
            String authorAvatar = null;

            if (StringUtils.hasText(userId)) {
                UserProfile userProfile = userProfileRepository.findById(userId).orElseGet(UserProfile::new);
                userFullName = getUserFullName(userProfile.getFirstName(), userProfile.getLastName());
                authorAvatar = userProfile.getImgUrl();
            }

                 postOutboxEvent = PostOutboxEvent.builder()
                                    .id(post.getId())
                                    .title(post.getTitle())
                                    .content(post.getContent())
                                    .resourceUrl(post.getResourceUrl())
                                    .resourceType(post.getResourceType().name())
                                    .authorId(userId)
                                    .authorName(userFullName)
                                    .authorAvatar(authorAvatar)
                                    .commentCount(post.getCommentCount())
                                    .voteCount(post.getVoteCount())
                                    .createdAt(post.getCreatedAt().toString())
                                    .build();
        } else {
            postOutboxEvent = PostOutboxEvent.builder()
                    .id(postId)
                    .build();
        }

        try {
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType("POST")
                    .aggregateId(postId)
                    .type(eventType)
                    .payload(objectMapper.writeValueAsString(postOutboxEvent))
                    .build();
            OutboxEvent saveEvent = outboxEventRepository.save(event);
            log.info("Save outbox event {}", saveEvent.getId());
        } catch (Exception e) {
            log.error("Error serializing outbox payload", e);
        }

    }

    private String getUserFullName(String firstName, String lastName){
        String actorFirstName = Objects.nonNull(firstName) ? firstName : "";
        String actorLastName = Objects.nonNull(lastName) ? lastName : "";
        String actorName = "Cine Social";

        if(StringUtils.hasText(actorFirstName) || StringUtils.hasText(actorLastName)){
            actorName = String.format("%s %s", actorFirstName, actorLastName);
        }

        return actorName;
    }

    private void deleteFileIfResourcePresent(Post post){
        if(Strings.isNotBlank(post.getResourceUrl())) {
            MinioFileDeletionEvent event = MinioFileDeletionEvent.builder()
                    .objectName(post.getResourceUrl())
                    .build();
            kafkaTemplate.send(FILE_DELETION_TOPIC, event);
        }
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
