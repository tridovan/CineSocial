package com.cine.social.mediaservice.service.impl;

import com.cine.social.mediaservice.property.MinioProperty;
import com.cine.social.mediaservice.service.VideoService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoServiceImpl implements VideoService {

    private final MinioClient minioClient;
    private final MinioProperty minioProperty;

    private static final String VIDEO_CONTENT_TYPE = "video/mp4";
    private static final String VIDEO_EXTENSION = ".mp4";
    private static final String TEMP_FILE_PREFIX_RAW = "raw_";
    private static final String TEMP_FILE_PREFIX_PROCESSED = "processed_";

    @Override
    public String processVideo(String originalFileName) {
        Path tempInput = null;
        Path tempOutput = null;
        String bucketName = minioProperty.getBucket();

        try {
            log.info("Downloading raw video: {}", originalFileName);
            
            // 1. Download file từ MinIO (Sử dụng try-with-resources để đảm bảo đóng Stream an toàn)
            try (InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(originalFileName)
                            .build())) {
                
                tempInput = Files.createTempFile(TEMP_FILE_PREFIX_RAW, VIDEO_EXTENSION);
                Files.copy(stream, tempInput, StandardCopyOption.REPLACE_EXISTING);
            }

            // 2. Chuẩn bị file output temp
            tempOutput = Files.createTempFile(TEMP_FILE_PREFIX_PROCESSED, VIDEO_EXTENSION);

            // 3. Gọi FFmpeg để nén video
            log.info("Starting FFmpeg compression...");
            compressVideo(tempInput.toFile(), tempOutput.toFile());

            // 4. Upload file đã nén lên MinIO
            String newFileName = TEMP_FILE_PREFIX_PROCESSED + originalFileName;
            log.info("Uploading processed video: {}", newFileName);

            try (InputStream uploadStream = new FileInputStream(tempOutput.toFile())) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(newFileName)
                                .stream(uploadStream, tempOutput.toFile().length(), -1)
                                .contentType(VIDEO_CONTENT_TYPE)
                                .build());
            }

            // 5. [UX Optimization] Xóa file Raw gốc để tiết kiệm dung lượng
            log.info("Cleaning up raw file from MinIO: {}", originalFileName);
            removeMinioObject(bucketName, originalFileName);

            return newFileName;

        } catch (Exception e) {
            log.error("Error processing video: {}", originalFileName, e);
            throw new RuntimeException("Video processing failed", e);
        } finally {
            // 6. Dọn dẹp file rác trên ổ cứng Local
            deleteTempFile(tempInput);
            deleteTempFile(tempOutput);
        }
    }

    private void removeMinioObject(String bucketName, String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            // Không throw exception ở đây để đảm bảo flow chính đã hoàn thành (upload xong) không bị fail chỉ vì lỗi xóa file cũ
            log.warn("Failed to delete raw file: {}", objectName, e);
        }
    }

    private void deleteTempFile(Path path) {
        if (path != null) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                log.warn("Failed to delete temp file: {}", path, e);
            }
        }
    }

    // Hàm gọi FFmpeg Command Line
    private void compressVideo(File input, File output) throws IOException, InterruptedException {
        // Lệnh FFmpeg: Nén về chuẩn H.264, CRF 28 (giảm dung lượng tốt mà giữ chất lượng ổn)
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg", "-y",             // -y: Overwrite output file
                "-i", input.getAbsolutePath(),
                "-vcodec", "libx264",
                "-crf", "28",               // CRF càng cao càng nhẹ (và xấu). 28 là mức tối ưu mobile.
                "-preset", "fast",          // Nén nhanh
                output.getAbsolutePath()
        );

        // KHÔNG dùng inheritIO() ở production để tránh spam log
        // processBuilder.inheritIO(); 
        processBuilder.redirectErrorStream(true); // Gộp stderr vào stdout để debug nếu cần thiết

        Process process = processBuilder.start();

        // FIX: Phải đọc Output Stream liên tục. Nếu không, buffer của OS sẽ đầy và Process sẽ bị treo (Deadlock).
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.info("[FFmpeg] {}", line);
            }
        }

        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IOException("FFmpeg failed with exit code " + exitCode);
        }
    }
}
