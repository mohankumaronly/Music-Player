package com.ranger.MusicPlatformApplication.storage.repository;

import com.ranger.MusicPlatformApplication.storage.entity.AssetCleanupRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetCleanupRecordRepository extends JpaRepository<AssetCleanupRecord, UUID> {

    List<AssetCleanupRecord> findByStatus(String status);
}
