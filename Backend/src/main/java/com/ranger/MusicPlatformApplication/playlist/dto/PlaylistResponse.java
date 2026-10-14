package com.ranger.MusicPlatformApplication.playlist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ranger.MusicPlatformApplication.playlist.entity.Playlist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlaylistResponse {

    private UUID id;
    private String name;
    private String description;
    private String coverUrl;
    private boolean isPublic;
    private long songCount;
    private List<PlaylistSongItemResponse> songs;
    private Instant createdAt;
    private Instant updatedAt;

    public static PlaylistResponse from(Playlist playlist, long songCount) {
        return PlaylistResponse.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .coverUrl(playlist.getCoverUrl())
                .isPublic(playlist.isPublic())
                .songCount(songCount)
                .createdAt(playlist.getCreatedAt())
                .updatedAt(playlist.getUpdatedAt())
                .build();
    }

    public static PlaylistResponse fromWithSongs(Playlist playlist, List<PlaylistSongItemResponse> songs) {
        return PlaylistResponse.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .coverUrl(playlist.getCoverUrl())
                .isPublic(playlist.isPublic())
                .songCount(songs != null ? songs.size() : 0)
                .songs(songs)
                .createdAt(playlist.getCreatedAt())
                .updatedAt(playlist.getUpdatedAt())
                .build();
    }
}
