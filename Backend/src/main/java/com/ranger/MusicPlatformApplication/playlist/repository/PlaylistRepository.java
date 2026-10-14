package com.ranger.MusicPlatformApplication.playlist.repository;

import com.ranger.MusicPlatformApplication.playlist.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {

    Page<Playlist> findByIsPublicTrue(Pageable pageable);

    Optional<Playlist> findByIdAndIsPublicTrue(UUID id);
}
