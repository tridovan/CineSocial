package com.cine.social.mediaservice.service;

import com.cine.social.mediaservice.dto.response.MediaResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MediaService {

    MediaResponse uploadImage(MultipartFile file);
    MediaResponse uploadVideo(MultipartFile file);
    void deleteFromMinIO(String objectName);
}
