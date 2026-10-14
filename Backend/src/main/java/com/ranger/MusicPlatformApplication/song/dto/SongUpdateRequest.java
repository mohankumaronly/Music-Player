package com.ranger.MusicPlatformApplication.song.dto;

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
public class SongUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    @NotBlank(message = "Artist name is required")
    @Size(max = 255, message = "Artist name must not exceed 255 characters")
    private String artistName;

    @Size(max = 255, message = "Album name must not exceed 255 characters")
    private String albumName;

    @Size(max = 100, message = "Genre must not exceed 100 characters")
    private String genre;
}
