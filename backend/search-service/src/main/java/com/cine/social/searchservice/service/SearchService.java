package com.cine.social.searchservice.service;

import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.searchservice.entity.PostDocument;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SearchService {
    PageResponse<List<PostDocument>> searchPosts(String keyword, String resourceType, Pageable pageable);
}
