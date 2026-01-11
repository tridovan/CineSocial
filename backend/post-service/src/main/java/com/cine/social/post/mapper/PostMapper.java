package com.cine.social.post.mapper;


import com.cine.social.post.dto.request.PostUpdateRequest;
import com.cine.social.post.dto.response.PostResponse;
import com.cine.social.post.entity.Post;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PostMapper {
    @Mapping(target = "resourceType", expression = "java(post.getResourceType().name())")
    PostResponse toResponse(Post post);
    void updatePost(@MappingTarget Post post, PostUpdateRequest request);
}
