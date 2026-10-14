package com.ranger.MusicPlatformApplication.playlist.service;

import com.ranger.MusicPlatformApplication.audit.entity.AuditLog;
import com.ranger.MusicPlatformApplication.audit.repository.AuditLogRepository;
import com.ranger.MusicPlatformApplication.common.exception.BadRequestException;
import com.ranger.MusicPlatformApplication.common.exception.ResourceNotFoundException;
import com.ranger.MusicPlatformApplication.playlist.dto.*;
import com.ranger.MusicPlatformApplication.playlist.entity.Playlist;
import com.ranger.MusicPlatformApplication.playlist.entity.PlaylistSong;
import com.ranger.MusicPlatformApplication.playlist.repository.PlaylistRepository;
import com.ranger.MusicPlatformApplication.playlist.repository.PlaylistSongRepository;
import com.ranger.MusicPlatformApplication.song.entity.Song;
import com.ranger.MusicPlatformApplication.song.entity.SongStatus;
import com.ranger.MusicPlatformApplication.song.repository.SongRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private static final Logger log = LoggerFactory.getLogger(PlaylistService.class);

    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final SongRepository songRepository;
    private final AuditLogRepository auditLogRepository;

    public PlaylistService(PlaylistRepository playlistRepository,
                           PlaylistSongRepository playlistSongRepository,
                           SongRepository songRepository,
                           AuditLogRepository auditLogRepository) {
        this.playlistRepository = playlistRepository;
        this.playlistSongRepository = playlistSongRepository;
        this.songRepository = songRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public PlaylistResponse createPlaylist(PlaylistRequest request) {
        Playlist playlist = Playlist.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .coverUrl(request.getCoverUrl() != null ? request.getCoverUrl().trim() : null)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .build();

        Playlist saved = playlistRepository.save(playlist);

        auditLogRepository.save(AuditLog.builder()
                .action("PLAYLIST_CREATED")
                .resourceType("PLAYLIST")
                .resourceId(saved.getId().toString())
                .details("Created playlist: " + saved.getName())
                .build());

        return PlaylistResponse.from(saved, 0);
    }

    @Transactional
    public PlaylistResponse updatePlaylist(UUID id, PlaylistRequest request) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + id));

        playlist.setName(request.getName().trim());
        playlist.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        playlist.setCoverUrl(request.getCoverUrl() != null ? request.getCoverUrl().trim() : null);
        if (request.getIsPublic() != null) {
            playlist.setPublic(request.getIsPublic());
        }

        Playlist updated = playlistRepository.save(playlist);
        long songCount = playlistSongRepository.countByPlaylistId(id);

        auditLogRepository.save(AuditLog.builder()
                .action("PLAYLIST_UPDATED")
                .resourceType("PLAYLIST")
                .resourceId(id.toString())
                .details("Updated playlist: " + updated.getName())
                .build());

        return PlaylistResponse.from(updated, songCount);
    }

    @Transactional
    public void deletePlaylist(UUID id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + id));

        playlistRepository.delete(playlist);

        auditLogRepository.save(AuditLog.builder()
                .action("PLAYLIST_DELETED")
                .resourceType("PLAYLIST")
                .resourceId(id.toString())
                .details("Deleted playlist: " + playlist.getName())
                .build());

        log.info("Successfully deleted playlist {}", id);
    }

    @Transactional
    public PlaylistSongItemResponse addSongToPlaylist(UUID playlistId, AddSongToPlaylistRequest request) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));

        Song song = songRepository.findById(request.getSongId())
                .orElseThrow(() -> new ResourceNotFoundException("Song not found with id: " + request.getSongId()));

        if (playlist.isPublic() && song.getStatus() != SongStatus.PUBLISHED) {
            throw new BadRequestException("Cannot add unpublished song to a public playlist.");
        }

        if (playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, song.getId())) {
            throw new BadRequestException("Song is already in this playlist.");
        }

        List<PlaylistSong> existingSongs = playlistSongRepository.findByPlaylistIdOrderByPositionAsc(playlistId);
        int targetPosition = (request.getPosition() != null && request.getPosition() >= 0 && request.getPosition() <= existingSongs.size())
                ? request.getPosition()
                : existingSongs.size();

        // Safe insertion with two-phase indexing to strictly avoid unique key collision
        for (int i = 0; i < existingSongs.size(); i++) {
            existingSongs.get(i).setPosition(-1 * (i + 1));
        }
        playlistSongRepository.saveAllAndFlush(existingSongs);

        PlaylistSong newPlaylistSong = PlaylistSong.builder()
                .playlist(playlist)
                .song(song)
                .position(targetPosition)
                .build();

        existingSongs.add(targetPosition, newPlaylistSong);

        // Reassign clean 0..N-1 positions
        for (int i = 0; i < existingSongs.size(); i++) {
            existingSongs.get(i).setPosition(i);
        }
        playlistSongRepository.saveAllAndFlush(existingSongs);

        auditLogRepository.save(AuditLog.builder()
                .action("SONG_ADDED_TO_PLAYLIST")
                .resourceType("PLAYLIST")
                .resourceId(playlistId.toString())
                .details("Added song " + song.getTitle() + " at position " + targetPosition)
                .build());

        return PlaylistSongItemResponse.from(newPlaylistSong);
    }

    @Transactional
    public PlaylistResponse reorderPlaylistSongs(UUID playlistId, ReorderSongsRequest request) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));

        List<PlaylistSong> existingSongs = playlistSongRepository.findByPlaylistIdOrderByPositionAsc(playlistId);

        if (existingSongs.size() != request.getSongIds().size()) {
            throw new BadRequestException("Song list size (" + request.getSongIds().size() +
                    ") does not match current playlist song count (" + existingSongs.size() + ").");
        }

        Map<UUID, PlaylistSong> songMap = existingSongs.stream()
                .collect(Collectors.toMap(ps -> ps.getSong().getId(), Function.identity()));

        Set<UUID> uniqueIncoming = new HashSet<>(request.getSongIds());
        if (uniqueIncoming.size() != request.getSongIds().size()) {
            throw new BadRequestException("Duplicate song IDs detected in reorder list.");
        }

        for (UUID songId : request.getSongIds()) {
            if (!songMap.containsKey(songId)) {
                throw new BadRequestException("Song ID " + songId + " does not belong to this playlist.");
            }
        }

        // Phase 1: Set temporary negative positions to prevent unique constraint conflicts
        for (int i = 0; i < existingSongs.size(); i++) {
            existingSongs.get(i).setPosition(-1 * (i + 1));
        }
        playlistSongRepository.saveAllAndFlush(existingSongs);

        // Phase 2: Set final 0-indexed positions
        List<PlaylistSongItemResponse> orderedItems = new ArrayList<>();
        for (int i = 0; i < request.getSongIds().size(); i++) {
            UUID songId = request.getSongIds().get(i);
            PlaylistSong ps = songMap.get(songId);
            ps.setPosition(i);
            orderedItems.add(PlaylistSongItemResponse.from(ps));
        }
        playlistSongRepository.saveAllAndFlush(existingSongs);

        auditLogRepository.save(AuditLog.builder()
                .action("PLAYLIST_REORDERED")
                .resourceType("PLAYLIST")
                .resourceId(playlistId.toString())
                .details("Reordered " + existingSongs.size() + " songs in playlist: " + playlist.getName())
                .build());

        return PlaylistResponse.fromWithSongs(playlist, orderedItems);
    }

    @Transactional
    public void removeSongFromPlaylist(UUID playlistId, UUID songId) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist not found with id: " + playlistId);
        }

        if (!playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, songId)) {
            throw new ResourceNotFoundException("Song with id " + songId + " is not in playlist " + playlistId);
        }

        playlistSongRepository.deleteByPlaylistIdAndSongId(playlistId, songId);

        // Re-index remaining songs to maintain consecutive positions 0..N-1
        List<PlaylistSong> remaining = playlistSongRepository.findByPlaylistIdOrderByPositionAsc(playlistId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(-1 * (i + 1));
        }
        playlistSongRepository.saveAllAndFlush(remaining);

        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i);
        }
        playlistSongRepository.saveAllAndFlush(remaining);

        auditLogRepository.save(AuditLog.builder()
                .action("SONG_REMOVED_FROM_PLAYLIST")
                .resourceType("PLAYLIST")
                .resourceId(playlistId.toString())
                .details("Removed song " + songId + " from playlist " + playlistId)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<PlaylistResponse> getPublicPlaylists(Pageable pageable) {
        return playlistRepository.findByIsPublicTrue(pageable)
                .map(p -> {
                    long count = playlistSongRepository.countByPlaylistId(p.getId());
                    return PlaylistResponse.from(p, count);
                });
    }

    @Transactional(readOnly = true)
    public PlaylistResponse getPublicPlaylistById(UUID id) {
        Playlist playlist = playlistRepository.findByIdAndIsPublicTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Public playlist not found with id: " + id));

        List<PlaylistSongItemResponse> songs = playlistSongRepository.findByPlaylistIdOrderByPositionAsc(id).stream()
                .map(PlaylistSongItemResponse::from)
                .toList();

        return PlaylistResponse.fromWithSongs(playlist, songs);
    }

    /**
     * Fetch songs for a PUBLIC playlist only.
     * Used by the public controller — throws 404 if the playlist is private or missing.
     */
    @Transactional(readOnly = true)
    public Page<PlaylistSongItemResponse> getPublicPlaylistSongs(UUID playlistId, Pageable pageable) {
        playlistRepository.findByIdAndIsPublicTrue(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Public playlist not found with id: " + playlistId));

        return playlistSongRepository.findByPlaylistIdOrderByPositionAsc(playlistId, pageable)
                .map(PlaylistSongItemResponse::from);
    }

    /**
     * Fetch songs for ANY playlist (public or private).
     * Used by the admin controller only — protected by ROLE_ADMIN.
     */
    @Transactional(readOnly = true)
    public Page<PlaylistSongItemResponse> getPlaylistSongsForAdmin(UUID playlistId, Pageable pageable) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist not found with id: " + playlistId);
        }
        return playlistSongRepository.findByPlaylistIdOrderByPositionAsc(playlistId, pageable)
                .map(PlaylistSongItemResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<PlaylistResponse> getAllPlaylists(Pageable pageable) {
        return playlistRepository.findAll(pageable)
                .map(p -> {
                    long count = playlistSongRepository.countByPlaylistId(p.getId());
                    return PlaylistResponse.from(p, count);
                });
    }

    @Transactional(readOnly = true)
    public PlaylistResponse getPlaylistById(UUID id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + id));

        List<PlaylistSongItemResponse> songs = playlistSongRepository.findByPlaylistIdOrderByPositionAsc(id).stream()
                .map(PlaylistSongItemResponse::from)
                .toList();

        return PlaylistResponse.fromWithSongs(playlist, songs);
    }
}
