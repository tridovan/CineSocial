package com.cine.social.mediaservice.controller;

import com.cine.social.common.dto.response.ApiResponse;
import com.cine.social.mediaservice.dto.response.MediaResponse;
import com.cine.social.mediaservice.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService imageService;

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MediaResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(imageService.uploadImage(file));
    }

    @PostMapping(value = "/upload/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MediaResponse> uploadVideo(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(imageService.uploadVideo(file));
    }


}