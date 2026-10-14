package com.ranger.MusicPlatformApplication.playlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistRequest {

    @NotBlank(message = "Playlist name is required")
    @Size(max = 255, message = "Playlist name must not exceed 255 characters")
    private String name;

    private String description;

    private String coverUrl;

    @Builder.Default
    private Boolean isPublic = true;
}
