package com.ranger.MusicPlatformApplication.playlist.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddSongToPlaylistRequest {

    @NotNull(message = "Song ID is required")
    private UUID songId;

    private Integer position;
}
