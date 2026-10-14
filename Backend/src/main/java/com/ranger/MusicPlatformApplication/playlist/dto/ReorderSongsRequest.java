package com.ranger.MusicPlatformApplication.playlist.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSongsRequest {

    @NotEmpty(message = "Song IDs list must not be empty")
    private List<@NotNull(message = "Song ID cannot be null") UUID> songIds;
}
