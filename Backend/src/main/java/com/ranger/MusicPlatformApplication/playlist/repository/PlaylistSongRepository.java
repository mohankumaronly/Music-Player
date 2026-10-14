package com.ranger.MusicPlatformApplication.playlist.repository;

import com.ranger.MusicPlatformApplication.playlist.entity.PlaylistSong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, UUID> {

    List<PlaylistSong> findByPlaylistIdOrderByPositionAsc(UUID playlistId);

    Page<PlaylistSong> findByPlaylistIdOrderByPositionAsc(UUID playlistId, Pageable pageable);

    Optional<PlaylistSong> findByPlaylistIdAndSongId(UUID playlistId, UUID songId);

    boolean existsByPlaylistIdAndSongId(UUID playlistId, UUID songId);

    long countByPlaylistId(UUID playlistId);

    @Modifying
    @Query("DELETE FROM PlaylistSong ps WHERE ps.playlist.id = :playlistId AND ps.song.id = :songId")
    void deleteByPlaylistIdAndSongId(@Param("playlistId") UUID playlistId, @Param("songId") UUID songId);

    @Modifying
    @Query("DELETE FROM PlaylistSong ps WHERE ps.song.id = :songId")
    void deleteBySongId(@Param("songId") UUID songId);
}
