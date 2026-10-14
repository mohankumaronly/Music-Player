package com.ranger.MusicPlatformApplication.song.controller;

import com.ranger.MusicPlatformApplication.common.ApiResponse;
import com.ranger.MusicPlatformApplication.common.PageResponse;
import com.ranger.MusicPlatformApplication.song.dto.SongResponse;
import com.ranger.MusicPlatformApplication.song.service.SongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/songs")
@Tag(name = "Public Songs", description = "Public endpoints for browsing and streaming songs")
public class PublicSongController {

    private final SongService songService;

    public PublicSongController(SongService songService) {
        this.songService = songService;
    }

    @GetMapping
    @Operation(summary = "List published songs", description = "Returns a paginated list of all publicly available songs.")
    public ResponseEntity<ApiResponse<PageResponse<SongResponse>>> getPublishedSongs(
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<SongResponse> page = PageResponse.from(songService.getPublishedSongs(pageable));
        return ResponseEntity.ok(ApiResponse.success("Songs retrieved successfully", page, httpRequest.getRequestURI()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get published song details", description = "Retrieves metadata and playable media URL for a published song.")
    public ResponseEntity<ApiResponse<SongResponse>> getSongById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        SongResponse song = songService.getPublishedSongById(id);
        return ResponseEntity.ok(ApiResponse.success("Song retrieved successfully", song, httpRequest.getRequestURI()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search published songs", description = "Searches published songs by title, artist name, album name, or genre.")
    public ResponseEntity<ApiResponse<PageResponse<SongResponse>>> searchSongs(
            @RequestParam(name = "q", defaultValue = "") String query,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<SongResponse> page = PageResponse.from(songService.searchPublishedSongs(query, pageable));
        return ResponseEntity.ok(ApiResponse.success("Search completed successfully", page, httpRequest.getRequestURI()));
    }
}
