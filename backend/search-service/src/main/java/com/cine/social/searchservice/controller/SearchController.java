package com.cine.social.searchservice.controller;


import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.common.utils.PageHelper;
import com.cine.social.searchservice.entity.PostDocument;
import com.cine.social.searchservice.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/posts")
    public ApiResponse<PageResponse<List<PostDocument>>> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String resourceType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt:desc") String sort
    ) {
        Pageable pageable = PageHelper.pageEngine(page, size, sort);

        return ApiResponse.success(searchService.searchPosts(keyword, resourceType, pageable));
    }
}
