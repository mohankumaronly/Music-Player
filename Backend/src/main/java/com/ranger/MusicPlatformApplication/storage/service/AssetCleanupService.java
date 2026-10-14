package com.ranger.MusicPlatformApplication.storage.service;

import com.ranger.MusicPlatformApplication.storage.MediaStorageService;
import com.ranger.MusicPlatformApplication.storage.entity.AssetCleanupRecord;
import com.ranger.MusicPlatformApplication.storage.repository.AssetCleanupRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssetCleanupService {

    private static final Logger log = LoggerFactory.getLogger(AssetCleanupService.class);

    private final AssetCleanupRecordRepository cleanupRepository;
    private final MediaStorageService mediaStorageService;

    public AssetCleanupService(AssetCleanupRecordRepository cleanupRepository, MediaStorageService mediaStorageService) {
        this.cleanupRepository = cleanupRepository;
        this.mediaStorageService = mediaStorageService;
    }

    @Transactional
    public void recordCleanup(String publicId, String resourceType, String errorMessage) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        AssetCleanupRecord record = AssetCleanupRecord.builder()
                .publicId(publicId)
                .resourceType(resourceType != null ? resourceType : "image")
                .status("PENDING")
                .retryCount(0)
                .errorMessage(errorMessage)
                .build();
        cleanupRepository.save(record);
        log.warn("Recorded asset {} ({}) for deferred cleanup. Reason: {}", publicId, resourceType, errorMessage);
    }

    @Transactional
    public void attemptImmediateCleanupOrRecord(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            mediaStorageService.deleteAsset(publicId, resourceType);
        } catch (Exception ex) {
            recordCleanup(publicId, resourceType, ex.getMessage());
        }
    }

    @Transactional
    public void processPendingCleanups() {
        List<AssetCleanupRecord> pendingRecords = cleanupRepository.findByStatus("PENDING");
        for (AssetCleanupRecord record : pendingRecords) {
            try {
                mediaStorageService.deleteAsset(record.getPublicId(), record.getResourceType());
                record.setStatus("COMPLETED");
                cleanupRepository.save(record);
                log.info("Deferred cleanup completed for asset: {}", record.getPublicId());
            } catch (Exception ex) {
                record.setRetryCount(record.getRetryCount() + 1);
                record.setErrorMessage(ex.getMessage());
                if (record.getRetryCount() >= 5) {
                    record.setStatus("FAILED");
                }
                cleanupRepository.save(record);
                log.warn("Deferred cleanup attempt {} failed for asset {}: {}",
                        record.getRetryCount(), record.getPublicId(), ex.getMessage());
            }
        }
    }
}
