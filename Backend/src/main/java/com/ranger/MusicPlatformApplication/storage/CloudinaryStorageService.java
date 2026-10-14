package com.ranger.MusicPlatformApplication.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ranger.MusicPlatformApplication.common.exception.BadRequestException;
import com.ranger.MusicPlatformApplication.common.exception.MediaStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryStorageService implements MediaStorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);

    private static final List<String> ALLOWED_AUDIO_EXTENSIONS = Arrays.asList(
            ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"
    );

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp"
    );

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public MediaUploadResult uploadAudio(MultipartFile file) {
        validateFile(file, ALLOWED_AUDIO_EXTENSIONS, "Audio");
        Path tempFile = null;
        try {
            tempFile = createTempFile(file, "audio_upload_");
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(tempFile.toFile(), ObjectUtils.asMap(
                    "resource_type", "video",
                    "folder", "music_platform/audio"
            ));

            String publicId = (String) uploadResult.get("public_id");
            String secureUrl = (String) uploadResult.get("secure_url");
            Integer durationSeconds = null;

            if (uploadResult.containsKey("duration") && uploadResult.get("duration") != null) {
                Number duration = (Number) uploadResult.get("duration");
                durationSeconds = (int) Math.round(duration.doubleValue());
            }

            log.info("Audio uploaded successfully to Cloudinary. Public ID: {}, Duration: {}s", publicId, durationSeconds);
            return new MediaUploadResult(publicId, secureUrl, durationSeconds);
        } catch (IOException ex) {
            log.error("Failed to upload audio to Cloudinary: {}", ex.getMessage(), ex);
            throw new MediaStorageException("Failed to upload audio file to Cloudinary", ex);
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    @Override
    public MediaUploadResult uploadImage(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE_EXTENSIONS, "Image");
        Path tempFile = null;
        try {
            tempFile = createTempFile(file, "image_upload_");
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(tempFile.toFile(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", "music_platform/covers"
            ));

            String publicId = (String) uploadResult.get("public_id");
            String secureUrl = (String) uploadResult.get("secure_url");

            log.info("Cover image uploaded successfully to Cloudinary. Public ID: {}", publicId);
            return new MediaUploadResult(publicId, secureUrl, null);
        } catch (IOException ex) {
            log.error("Failed to upload image to Cloudinary: {}", ex.getMessage(), ex);
            throw new MediaStorageException("Failed to upload image to Cloudinary", ex);
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    @Override
    public void deleteAsset(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", resourceType != null ? resourceType : "image"
            ));
            log.info("Destroyed asset {} on Cloudinary: {}", publicId, result);
        } catch (Exception ex) {
            log.error("Failed to delete asset {} from Cloudinary: {}", publicId, ex.getMessage(), ex);
            throw new MediaStorageException("Failed to delete asset from Cloudinary: " + publicId, ex);
        }
    }

    private void validateFile(MultipartFile file, List<String> allowedExtensions, String fileTypeLabel) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(fileTypeLabel + " file must not be empty");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Invalid filename");
        }
        String lowerFilename = originalFilename.toLowerCase();
        boolean validExtension = allowedExtensions.stream().anyMatch(lowerFilename::endsWith);
        if (!validExtension) {
            throw new BadRequestException(fileTypeLabel + " file must have one of the following extensions: " + allowedExtensions);
        }
    }

    private Path createTempFile(MultipartFile file, String prefix) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        Path tempFile = Files.createTempFile(prefix, extension);
        Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
        return tempFile;
    }

    private void cleanupTempFile(Path tempFile) {
        if (tempFile != null) {
            try {
                Files.deleteIfExists(tempFile);
            } catch (IOException e) {
                log.warn("Could not delete temporary file: {}", tempFile, e);
            }
        }
    }
}
