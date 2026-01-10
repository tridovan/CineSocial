package com.cine.social.post.mapper;

import com.cine.social.post.dto.response.CommentResponse;
import com.cine.social.post.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommentMapper {

    @Mapping(target = "parenCommentId", source = "parent.id")
    CommentResponse toResponse(Comment comment);

}
