package com.cine.social.searchservice.service;

import co.elastic.clients.elasticsearch._types.query_dsl.FieldValueFactorModifier;
import co.elastic.clients.elasticsearch._types.query_dsl.FunctionBoostMode;
import co.elastic.clients.elasticsearch._types.query_dsl.FunctionScoreMode;
import com.cine.social.common.dto.response.PageResponse;
import com.cine.social.searchservice.entity.PostDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.FetchSourceFilter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchServiceImpl implements SearchService {

    private final ElasticsearchOperations elasticsearchOperations;

    @Override
    public PageResponse<List<PostDocument>> searchPosts(String keyword, String resourceType, Pageable pageable) {
        if (StringUtils.hasText(keyword)) {
            pageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        }

        var queryBuilder = NativeQuery.builder()
                .withPageable(pageable);

        if (StringUtils.hasText(keyword)) {
            queryBuilder.withQuery(q -> q
                    .functionScore(fs -> fs
                            .query(mq -> mq
                                    .multiMatch(m -> m
                                            .fields("title^3", "content", "authorName^2")
                                            .query(keyword)
                                            .fuzziness("AUTO")
                                            .minimumShouldMatch("70%")
                                    )
                            )
                            .functions(f -> f
                                    .filter(fn -> fn.matchAll(m -> m))
                                    .fieldValueFactor(fv -> fv
                                            .field("voteCount")
                                            .factor(0.1)
                                            .modifier(FieldValueFactorModifier.Log1p)
                                            .missing(0.0)
                                    )
                            )
                            .functions(f -> f
                                    .filter(fn -> fn.matchAll(m -> m))
                                    .fieldValueFactor(fv -> fv
                                            .field("commentCount")
                                            .factor(0.05)
                                            .modifier(FieldValueFactorModifier.Log1p)
                                            .missing(0.0)
                                    )
                            )
                            .boostMode(FunctionBoostMode.Sum)
                            .scoreMode(FunctionScoreMode.Sum)
                    )
            );
        } else {
            queryBuilder.withQuery(q -> q.matchAll(m -> m));
        }

        if (StringUtils.hasText(resourceType)) {
            queryBuilder.withFilter(f -> f
                    .term(t -> t.field("resourceType").value(resourceType))
            );
        }

        SearchHits<PostDocument> searchHits = elasticsearchOperations.search(queryBuilder.build(), PostDocument.class);

        List<PostDocument> posts = searchHits.stream()
                .map(SearchHit::getContent)
                .toList();

        return PageResponse.<List<PostDocument>>builder()
                .pageNo(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .totalPage((int) Math.ceil((double) searchHits.getTotalHits() / pageable.getPageSize()))
                .totalElement(searchHits.getTotalHits())
                .items(posts)
                .build();
    }

    @Override
    public List<String> autocompletePosts(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return List.of();
        }

        var query = NativeQuery.builder()
                .withQuery(q -> q
                        .matchPhrasePrefix(mpp -> mpp
                                .field("title")
                                .query(keyword)
                        )
                )
                .withPageable(Pageable.ofSize(10))
                .withSourceFilter(new FetchSourceFilter(new String[]{"title"}, null))
                .build();

        SearchHits<PostDocument> searchHits = elasticsearchOperations.search(query, PostDocument.class);

        return searchHits.stream()
                .map(hit -> hit.getContent().getTitle())
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }
}