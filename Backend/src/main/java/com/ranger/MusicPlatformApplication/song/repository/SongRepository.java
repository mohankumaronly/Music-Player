package com.ranger.MusicPlatformApplication.song.repository;

import com.ranger.MusicPlatformApplication.song.entity.Song;
import com.ranger.MusicPlatformApplication.song.entity.SongStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SongRepository extends JpaRepository<Song, UUID> {

    Page<Song> findByStatus(SongStatus status, Pageable pageable);

    Optional<Song> findByIdAndStatus(UUID id, SongStatus status);

    @Query("SELECT s FROM Song s WHERE s.status = :status AND (" +
            "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.artistName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.albumName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.genre) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Song> searchPublishedSongs(@Param("query") String query, @Param("status") SongStatus status, Pageable pageable);
}
