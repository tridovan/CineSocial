package com.cine.social.post.service.impl;

import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.common.exception.AppException;
import com.cine.social.common.utils.PageHelper;
import com.cine.social.common.utils.SecurityUtils;
import com.cine.social.event.MinioFileDeletionEvent;
import com.cine.social.post.constant.PostErrorCode;
import com.cine.social.post.dto.request.CommentRequest;
import com.cine.social.post.dto.response.CommentResponse;
import com.cine.social.post.entity.Comment;
import com.cine.social.post.entity.CommentVote;
import com.cine.social.post.entity.Post;
import com.cine.social.post.mapper.CommentMapper;
import com.cine.social.post.repository.CommentRepository;
import com.cine.social.post.repository.CommentVoteRepository;
import com.cine.social.post.repository.PostRepository;
import com.cine.social.post.service.CommentService;
import com.cine.social.post.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final CommentVoteRepository commentVoteRepository;
    private final PostRepository postRepository;
    private final CommentMapper commentMapper;
    private final UserProfileService userProfileService;

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final static String FILE_DELETION_TOPIC = "file-deletion-topic";


    @Override
    @Transactional
    public CommentResponse createComment(String postId, CommentRequest request) {
        String currentUserId = SecurityUtils.getCurrentUserId();

        userProfileService.ensureUserProfileExists(currentUserId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.POST_NOT_FOUND));


        Comment parentComment = null;
        String replyToUserId = null;

        if (Objects.nonNull(request.getParenCommentId())) {
            parentComment = commentRepository.findById(request.getParenCommentId())
                    .orElseThrow(() -> new AppException(PostErrorCode.COMMENT_NOT_FOUND));

            if (!Objects.equals(parentComment.getPost().getId(), post.getId())) {
                throw new AppException(PostErrorCode.COMMENT_NOT_SAME_THE_POST);
            }

            replyToUserId = parentComment.getAuthorId();

            if (parentComment.getParent() != null) {
                parentComment = parentComment.getParent();
            }

            parentComment.setReplyCount(parentComment.getReplyCount() + 1);
            commentRepository.save(parentComment);
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .imgUrl(request.getImgUrl())
                .post(post)
                .authorId(currentUserId)
                .parent(parentComment)
                .replyToUserId(replyToUserId)
                .replyCount(0)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return commentMapper.toResponse(savedComment);
    }

    @Override
    public PageResponse<List<CommentResponse>> getCommentsByPostId(String postId, int page, int size) {
        Pageable pageable = PageHelper.pageEngine(page, size, "replyCount:desc", "createdAt:desc");

        Page<Comment> commentPage = commentRepository.findRootCommentsByPostId(postId, pageable);

        return buildPageResponse(commentPage, page, size);
    }

    @Override
    public PageResponse<List<CommentResponse>> getReplies(String commentId, int page, int size) {
        Pageable pageable = PageHelper.pageEngine(page, size, "createdAt:asc");

        Page<Comment> replyPage = commentRepository.findRepliesByParentId(commentId, pageable);

        return buildPageResponse(replyPage, page, size);
    }

    @Override
    public void deleteComment(String commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new AppException(PostErrorCode.COMMENT_NOT_FOUND));
        commentRepository.delete(comment);
        deleteFileIfResourcePresent(comment);
    }



    private void deleteFileIfResourcePresent(Comment comment){
        if(Strings.isNotBlank(comment.getImgUrl())) {
            MinioFileDeletionEvent event = MinioFileDeletionEvent.builder()
                    .objectName(comment.getImgUrl())
                    .build();
            kafkaTemplate.send(FILE_DELETION_TOPIC, event);
        }
    }


    @Override
    public void updateComment(String id, String content) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new AppException(PostErrorCode.COMMENT_NOT_FOUND));
        comment.setContent(content);
        commentRepository.save(comment);

    }

    @Override
    @Transactional
    public void voteComment(String commentId, int value) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(PostErrorCode.COMMENT_NOT_FOUND));

        if (value != 1 && value != -1 && value != 0) {
            throw new AppException(PostErrorCode.INVALID_VOTE_VALUE);
        }

        Optional<CommentVote> existingVoteOpt = commentVoteRepository.findByUserIdAndComment(currentUserId, comment);
        int currentVoteCount = comment.getVoteCount();

        if (existingVoteOpt.isPresent()) {
            CommentVote existingVote = existingVoteOpt.get();
            int oldValue = existingVote.getValue();

            if (value == 0) {
                commentVoteRepository.delete(existingVote);
                comment.setVoteCount(currentVoteCount - oldValue);
            } else if (oldValue != value) {
                existingVote.setValue(value);
                commentVoteRepository.save(existingVote);
                comment.setVoteCount(currentVoteCount - oldValue + value);
            }
        } else {
            if (value != 0) {
                CommentVote newVote = CommentVote.builder()
                        .userId(currentUserId)
                        .comment(comment)
                        .value(value)
                        .build();
                commentVoteRepository.save(newVote);
                comment.setVoteCount(currentVoteCount + value);
            }
        }
        commentRepository.save(comment);
    }

    private PageResponse<List<CommentResponse>>buildPageResponse(Page<Comment> pageData, int page, int size) {
        List<Comment> comments = pageData.getContent();
        Map<String, Integer> userVotesMap = new HashMap<>();

        try {
            String currentUserId = SecurityUtils.getCurrentUserId();
            if (currentUserId != null && !comments.isEmpty()) {
                List<String> commentIds = comments.stream().map(Comment::getId).toList();
                List<CommentVote> votes = commentVoteRepository.findAllByUserIdAndCommentIds(currentUserId, commentIds);
                for (CommentVote v : votes) {
                    userVotesMap.put(v.getComment().getId(), v.getValue());
                }
            }
        } catch (Exception e) {
            // User not logged in, ignore
        }

        List<CommentResponse> items = comments.stream()
                .map(comment -> {
                    CommentResponse res = commentMapper.toResponse(comment);
                    res.setVoteCount(comment.getVoteCount());
                    res.setUserVoteValue(userVotesMap.getOrDefault(comment.getId(), 0));
                    return res;
                })
                .toList();

        return PageResponse.<List<CommentResponse>>builder()
                .pageNo(page)
                .pageSize(size)
                .totalPage(pageData.getTotalPages())
                .totalElement(pageData.getTotalElements())
                .items(items)
                .build();
    }
}