package com.ranger.MusicPlatformApplication.song.controller;

import com.ranger.MusicPlatformApplication.common.ApiResponse;
import com.ranger.MusicPlatformApplication.common.PageResponse;
import com.ranger.MusicPlatformApplication.song.dto.SongResponse;
import com.ranger.MusicPlatformApplication.song.dto.SongStatusUpdateRequest;
import com.ranger.MusicPlatformApplication.song.dto.SongUpdateRequest;
import com.ranger.MusicPlatformApplication.song.entity.SongStatus;
import com.ranger.MusicPlatformApplication.song.service.SongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/songs")
@Tag(name = "Admin Songs", description = "Protected administrator endpoints for uploading, managing, and publishing songs")
@SecurityRequirement(name = "bearerAuth")
@SecurityRequirement(name = "cookieAuth")
public class AdminSongController {

    private final SongService songService;

    public AdminSongController(SongService songService) {
        this.songService = songService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and create a new song", description = "Uploads audio file (and optional cover image) to Cloudinary and saves song in DRAFT status.")
    public ResponseEntity<ApiResponse<SongResponse>> uploadSong(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("artistName") String artistName,
            @RequestParam(value = "albumName", required = false) String albumName,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            HttpServletRequest httpRequest) {

        SongResponse createdSong = songService.createSong(title, description, artistName, albumName, genre, audio, cover);
        ApiResponse<SongResponse> response = ApiResponse.success(
                "Song created successfully",
                createdSong,
                httpRequest.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List all songs (Admin)", description = "Retrieves all songs across all statuses with optional status filtering.")
    public ResponseEntity<ApiResponse<PageResponse<SongResponse>>> getAllSongs(
            @RequestParam(value = "status", required = false) SongStatus status,
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<SongResponse> page = PageResponse.from(songService.getAllSongs(status, pageable));
        return ResponseEntity.ok(ApiResponse.success("Songs retrieved successfully", page, httpRequest.getRequestURI()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get song details by ID (Admin)", description = "Retrieves full details of a song regardless of its publish status.")
    public ResponseEntity<ApiResponse<SongResponse>> getSongById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        SongResponse song = songService.getSongById(id);
        return ResponseEntity.ok(ApiResponse.success("Song retrieved successfully", song, httpRequest.getRequestURI()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update song metadata", description = "Updates title, description, artist name, album name, or genre without re-uploading media.")
    public ResponseEntity<ApiResponse<SongResponse>> updateSongMetadata(
            @PathVariable UUID id,
            @Valid @RequestBody SongUpdateRequest request,
            HttpServletRequest httpRequest) {

        SongResponse updated = songService.updateSongMetadata(id, request);
        return ResponseEntity.ok(ApiResponse.success("Song updated successfully", updated, httpRequest.getRequestURI()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Publish or unpublish song", description = "Updates song status to DRAFT, PUBLISHED, or UNPUBLISHED.")
    public ResponseEntity<ApiResponse<SongResponse>> updateSongStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SongStatusUpdateRequest request,
            HttpServletRequest httpRequest) {

        SongResponse updated = songService.updateSongStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Song status updated successfully", updated, httpRequest.getRequestURI()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a song", description = "Deletes the song from the database and cleans up assets from Cloudinary.")
    public ResponseEntity<Void> deleteSong(@PathVariable UUID id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}
