package com.ranger.MusicPlatformApplication.song.service;

import com.ranger.MusicPlatformApplication.audit.entity.AuditLog;
import com.ranger.MusicPlatformApplication.audit.repository.AuditLogRepository;
import com.ranger.MusicPlatformApplication.common.exception.BadRequestException;
import com.ranger.MusicPlatformApplication.common.exception.ResourceNotFoundException;
import com.ranger.MusicPlatformApplication.playlist.repository.PlaylistSongRepository;
import com.ranger.MusicPlatformApplication.song.dto.SongResponse;
import com.ranger.MusicPlatformApplication.song.dto.SongStatusUpdateRequest;
import com.ranger.MusicPlatformApplication.song.dto.SongUpdateRequest;
import com.ranger.MusicPlatformApplication.song.entity.Song;
import com.ranger.MusicPlatformApplication.song.entity.SongStatus;
import com.ranger.MusicPlatformApplication.song.repository.SongRepository;
import com.ranger.MusicPlatformApplication.storage.MediaStorageService;
import com.ranger.MusicPlatformApplication.storage.service.AssetCleanupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class SongService {

    private static final Logger log = LoggerFactory.getLogger(SongService.class);

    private final SongRepository songRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final MediaStorageService storageService;
    private final AssetCleanupService cleanupService;
    private final AuditLogRepository auditLogRepository;

    public SongService(SongRepository songRepository,
                       PlaylistSongRepository playlistSongRepository,
                       MediaStorageService storageService,
                       AssetCleanupService cleanupService,
                       AuditLogRepository auditLogRepository) {
        this.songRepository = songRepository;
        this.playlistSongRepository = playlistSongRepository;
        this.storageService = storageService;
        this.cleanupService = cleanupService;
        this.auditLogRepository = auditLogRepository;
    }

    public SongResponse createSong(String title, String description, String artistName,
                                   String albumName, String genre,
                                   MultipartFile audioFile, MultipartFile coverFile) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Song title is required");
        }
        if (artistName == null || artistName.isBlank()) {
            throw new BadRequestException("Artist name is required");
        }
        if (audioFile == null || audioFile.isEmpty()) {
            throw new BadRequestException("Audio file is required");
        }

        MediaStorageService.MediaUploadResult audioResult = storageService.uploadAudio(audioFile);
        MediaStorageService.MediaUploadResult coverResult = null;

        if (coverFile != null && !coverFile.isEmpty()) {
            try {
                coverResult = storageService.uploadImage(coverFile);
            } catch (Exception ex) {
                // If cover upload fails, compensate by deleting the audio file that was just uploaded
                storageService.deleteAsset(audioResult.publicId(), "video");
                throw ex;
            }
        }

        Song song = Song.builder()
                .title(title.trim())
                .description(description != null ? description.trim() : null)
                .artistName(artistName.trim())
                .albumName(albumName != null ? albumName.trim() : null)
                .genre(genre != null ? genre.trim() : null)
                .durationSeconds(audioResult.durationSeconds())
                .audioPublicId(audioResult.publicId())
                .audioUrl(audioResult.url())
                .coverPublicId(coverResult != null ? coverResult.publicId() : null)
                .coverUrl(coverResult != null ? coverResult.url() : null)
                .status(SongStatus.DRAFT)
                .build();

        try {
            Song savedSong = songRepository.save(song);

            auditLogRepository.save(AuditLog.builder()
                    .action("SONG_CREATED")
                    .resourceType("SONG")
                    .resourceId(savedSong.getId().toString())
                    .details("Created song: " + savedSong.getTitle())
                    .build());

            log.info("Created song record with ID: {}", savedSong.getId());
            return SongResponse.from(savedSong);
        } catch (Exception ex) {
            log.error("Failed to save song to database. Initiating Cloudinary cleanup compensation...", ex);
            cleanupService.attemptImmediateCleanupOrRecord(audioResult.publicId(), "video");
            if (coverResult != null) {
                cleanupService.attemptImmediateCleanupOrRecord(coverResult.publicId(), "image");
            }
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> getPublishedSongs(Pageable pageable) {
        return songRepository.findByStatus(SongStatus.PUBLISHED, pageable)
                .map(SongResponse::from);
    }

    @Transactional(readOnly = true)
    public SongResponse getPublishedSongById(UUID id) {
        Song song = songRepository.findByIdAndStatus(id, SongStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Published song not found with id: " + id));
        return SongResponse.from(song);
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> searchPublishedSongs(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return getPublishedSongs(pageable);
        }
        return songRepository.searchPublishedSongs(query.trim(), SongStatus.PUBLISHED, pageable)
                .map(SongResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> getAllSongs(SongStatus status, Pageable pageable) {
        if (status != null) {
            return songRepository.findByStatus(status, pageable).map(SongResponse::from);
        }
        return songRepository.findAll(pageable).map(SongResponse::from);
    }

    @Transactional(readOnly = true)
    public SongResponse getSongById(UUID id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + id));
        return SongResponse.from(song);
    }

    @Transactional
    public SongResponse updateSongMetadata(UUID id, SongUpdateRequest request) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + id));

        song.setTitle(request.getTitle().trim());
        song.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        song.setArtistName(request.getArtistName().trim());
        song.setAlbumName(request.getAlbumName() != null ? request.getAlbumName().trim() : null);
        song.setGenre(request.getGenre() != null ? request.getGenre().trim() : null);

        Song updated = songRepository.save(song);

        auditLogRepository.save(AuditLog.builder()
                .action("SONG_METADATA_UPDATED")
                .resourceType("SONG")
                .resourceId(id.toString())
                .details("Updated metadata for song: " + updated.getTitle())
                .build());

        return SongResponse.from(updated);
    }

    @Transactional
    public SongResponse updateSongStatus(UUID id, SongStatusUpdateRequest request) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + id));

        if (request.getStatus() == SongStatus.PUBLISHED) {
            if (song.getAudioUrl() == null || song.getAudioUrl().isBlank()) {
                throw new BadRequestException("Song cannot be published without a valid audio file.");
            }
        }

        song.setStatus(request.getStatus());
        Song updated = songRepository.save(song);

        auditLogRepository.save(AuditLog.builder()
                .action("SONG_STATUS_CHANGED")
                .resourceType("SONG")
                .resourceId(id.toString())
                .details("Changed status of song " + id + " to " + request.getStatus())
                .build());

        return SongResponse.from(updated);
    }

    @Transactional
    public void deleteSong(UUID id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + id));

        // Delete associations in playlists
        playlistSongRepository.deleteBySongId(id);

        String audioPublicId = song.getAudioPublicId();
        String coverPublicId = song.getCoverPublicId();

        songRepository.delete(song);

        // Clean up Cloudinary assets
        if (audioPublicId != null) {
            cleanupService.attemptImmediateCleanupOrRecord(audioPublicId, "video");
        }
        if (coverPublicId != null) {
            cleanupService.attemptImmediateCleanupOrRecord(coverPublicId, "image");
        }

        auditLogRepository.save(AuditLog.builder()
                .action("SONG_DELETED")
                .resourceType("SONG")
                .resourceId(id.toString())
                .details("Deleted song: " + song.getTitle())
                .build());

        log.info("Successfully deleted song {} and queued media asset cleanup", id);
    }
}
