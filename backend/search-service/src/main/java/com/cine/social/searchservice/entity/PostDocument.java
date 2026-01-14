package com.cine.social.searchservice.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.Date;

@Data
@Builder
@Document(indexName = "posts")
public class PostDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String content;

    @Field(type = FieldType.Keyword, index = false)
    private String resourceUrl;

    @Field(type = FieldType.Keyword, index = false)
    private String authorAvatar;

    @Field(type = FieldType.Keyword)
    private String resourceType;

    @Field(type = FieldType.Keyword)
    private String authorId;

    @Field(type = FieldType.Text)
    private String authorName;

    @Field(type = FieldType.Integer)
    private int voteCount;

    @Field(type = FieldType.Integer)
    private int commentCount;

    @Field(type = FieldType.Date, format = DateFormat.date_optional_time)
    private Date createdAt;
}