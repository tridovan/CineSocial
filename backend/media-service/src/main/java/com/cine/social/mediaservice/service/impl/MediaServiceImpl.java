package com.cine.social.mediaservice.service.impl;

import com.cine.social.common.exception.AppException;
import com.cine.social.mediaservice.constant.MediaErrorCode;
import com.cine.social.mediaservice.dto.response.MediaResponse;
import com.cine.social.mediaservice.property.MinioProperty;
import com.cine.social.mediaservice.service.MediaService;
import io.minio.DeleteObjectTagsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaServiceImpl implements MediaService {

    private final MinioClient minioClient;

    private final MinioProperty minioProperty;

    private static final String IMAGE_PREFIX = "img_";
    private static final String VIDEO_PREFIX = "raw_vid_";
    private static final String TYPE_IMAGE = "IMAGE";
    private static final String TYPE_VIDEO = "VIDEO";

    @Override
    public MediaResponse uploadImage(MultipartFile file) {
        validateFile(file, "image/");
        String fileName = generateUniqueFileName(file, IMAGE_PREFIX);

        uploadToMinio(file, fileName);

        log.info("Uploaded image: {}", fileName);

        return MediaResponse.builder()
                .url(fileName)
                .type(TYPE_IMAGE)
                .build();
    }

    @Override
    public MediaResponse uploadVideo(MultipartFile file) {
        validateFile(file, "video/");
        String rawFileName = generateUniqueFileName(file, VIDEO_PREFIX);

        uploadToMinio(file, rawFileName);

        log.info("Uploaded and processed video: {}", rawFileName);

        return MediaResponse.builder()
                .url(rawFileName)
                .type(TYPE_VIDEO)
                .build();
    }

    private void validateFile(MultipartFile file, String expectedTypePrefix) {
        if (file.isEmpty()) {
            throw new AppException(MediaErrorCode.EMPTY_FILE);
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith(expectedTypePrefix)) {
            throw new AppException(MediaErrorCode.INVALID_FILE);
        }
    }

    private String generateUniqueFileName(MultipartFile file, String prefix) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return prefix + UUID.randomUUID() + extension;
    }

    private void uploadToMinio(MultipartFile file, String objectName) {
        try (InputStream stream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperty.getBucket())
                            .object(objectName)
                            .stream(stream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        } catch (Exception e) {
            log.error("File upload to MinIO failed: {}", objectName, e);
            throw new AppException(MediaErrorCode.UPLOAD_FAILED);
        }
    }

    @Override
    @SneakyThrows
    public void deleteFromMinIO(String objectName){
        minioClient.removeObject(RemoveObjectArgs.builder()
                        .bucket(minioProperty.getBucket())
                        .object(objectName)
                .build());
    }
}