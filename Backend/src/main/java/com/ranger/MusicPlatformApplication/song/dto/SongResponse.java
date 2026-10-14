package com.ranger.MusicPlatformApplication.song.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ranger.MusicPlatformApplication.song.entity.Song;
import com.ranger.MusicPlatformApplication.song.entity.SongStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SongResponse {

    private UUID id;
    private String title;
    private String description;
    private String artistName;
    private String albumName;
    private String genre;
    private Integer durationSeconds;
    private String audioUrl;
    private String coverUrl;
    private SongStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public static SongResponse from(Song song) {
        return SongResponse.builder()
                .id(song.getId())
                .title(song.getTitle())
                .description(song.getDescription())
                .artistName(song.getArtistName())
                .albumName(song.getAlbumName())
                .genre(song.getGenre())
                .durationSeconds(song.getDurationSeconds())
                .audioUrl(song.getAudioUrl())
                .coverUrl(song.getCoverUrl())
                .status(song.getStatus())
                .createdAt(song.getCreatedAt())
                .updatedAt(song.getUpdatedAt())
                .build();
    }
}
