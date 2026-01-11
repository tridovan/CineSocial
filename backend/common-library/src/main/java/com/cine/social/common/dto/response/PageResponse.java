package com.cine.social.common.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private int pageNo;
    private int pageSize;
    private int totalPage;
    private long totalElement;
    private String[] sortBy;
    private T items;
}
