package com.ranger.MusicPlatformApplication.storage;

import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {

    record MediaUploadResult(String publicId, String url, Integer durationSeconds) {}

    MediaUploadResult uploadAudio(MultipartFile file);

    MediaUploadResult uploadImage(MultipartFile file);

    void deleteAsset(String publicId, String resourceType);
}
