package com.ranger.MusicPlatformApplication.song.dto;

import com.ranger.MusicPlatformApplication.song.entity.SongStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongStatusUpdateRequest {

    @NotNull(message = "Status is required (DRAFT, PUBLISHED, or UNPUBLISHED)")
    private SongStatus status;
}
