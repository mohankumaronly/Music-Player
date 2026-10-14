package com.ranger.MusicPlatformApplication.playlist.controller;

import com.ranger.MusicPlatformApplication.common.ApiResponse;
import com.ranger.MusicPlatformApplication.common.PageResponse;
import com.ranger.MusicPlatformApplication.playlist.dto.*;
import com.ranger.MusicPlatformApplication.playlist.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/playlists")
@Tag(name = "Admin Playlists", description = "Protected administrator endpoints for creating and curating playlists")
@SecurityRequirement(name = "bearerAuth")
@SecurityRequirement(name = "cookieAuth")
public class AdminPlaylistController {

    private final PlaylistService playlistService;

    public AdminPlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping
    @Operation(summary = "Create a playlist", description = "Creates a new playlist.")
    public ResponseEntity<ApiResponse<PlaylistResponse>> createPlaylist(
            @Valid @RequestBody PlaylistRequest request,
            HttpServletRequest httpRequest) {

        PlaylistResponse created = playlistService.createPlaylist(request);
        ApiResponse<PlaylistResponse> response = ApiResponse.success(
                "Playlist created successfully",
                created,
                httpRequest.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List all playlists (Admin)", description = "Retrieves all playlists, including private ones.")
    public ResponseEntity<ApiResponse<PageResponse<PlaylistResponse>>> getAllPlaylists(
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<PlaylistResponse> page = PageResponse.from(playlistService.getAllPlaylists(pageable));
        return ResponseEntity.ok(ApiResponse.success("Playlists retrieved successfully", page, httpRequest.getRequestURI()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get playlist with songs (Admin)", description = "Retrieves playlist details and full ordered songs list.")
    public ResponseEntity<ApiResponse<PlaylistResponse>> getPlaylistById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        PlaylistResponse playlist = playlistService.getPlaylistById(id);
        return ResponseEntity.ok(ApiResponse.success("Playlist retrieved successfully", playlist, httpRequest.getRequestURI()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update playlist", description = "Updates playlist name, description, cover URL, or public status.")
    public ResponseEntity<ApiResponse<PlaylistResponse>> updatePlaylist(
            @PathVariable UUID id,
            @Valid @RequestBody PlaylistRequest request,
            HttpServletRequest httpRequest) {

        PlaylistResponse updated = playlistService.updatePlaylist(id, request);
        return ResponseEntity.ok(ApiResponse.success("Playlist updated successfully", updated, httpRequest.getRequestURI()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete playlist", description = "Deletes playlist and its song memberships.")
    public ResponseEntity<Void> deletePlaylist(@PathVariable UUID id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/songs")
    @Operation(summary = "Add song to playlist", description = "Appends or inserts a song into the playlist.")
    public ResponseEntity<ApiResponse<PlaylistSongItemResponse>> addSongToPlaylist(
            @PathVariable UUID id,
            @Valid @RequestBody AddSongToPlaylistRequest request,
            HttpServletRequest httpRequest) {

        PlaylistSongItemResponse added = playlistService.addSongToPlaylist(id, request);
        ApiResponse<PlaylistSongItemResponse> response = ApiResponse.success(
                "Song added to playlist successfully",
                added,
                httpRequest.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/songs/reorder")
    @Operation(summary = "Reorder playlist songs", description = "Updates the sequential order of all songs in the playlist.")
    public ResponseEntity<ApiResponse<PlaylistResponse>> reorderPlaylistSongs(
            @PathVariable UUID id,
            @Valid @RequestBody ReorderSongsRequest request,
            HttpServletRequest httpRequest) {

        PlaylistResponse reordered = playlistService.reorderPlaylistSongs(id, request);
        return ResponseEntity.ok(ApiResponse.success("Playlist songs reordered successfully", reordered, httpRequest.getRequestURI()));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    @Operation(summary = "Remove song from playlist", description = "Removes a specific song from the playlist and re-indexes remaining song positions.")
    public ResponseEntity<Void> removeSongFromPlaylist(
            @PathVariable UUID id,
            @PathVariable UUID songId) {

        playlistService.removeSongFromPlaylist(id, songId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/songs")
    @Operation(
            summary = "Fetch playlist songs (Admin)",
            description = "Returns a paginated list of songs within any playlist, including private ones."
    )
    public ResponseEntity<ApiResponse<PageResponse<PlaylistSongItemResponse>>> getPlaylistSongs(
            @PathVariable UUID id,
            @PageableDefault(page = 0, size = 20, sort = "position", direction = Sort.Direction.ASC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<PlaylistSongItemResponse> page = PageResponse.from(
                playlistService.getPlaylistSongsForAdmin(id, pageable));

        return ResponseEntity.ok(ApiResponse.success(
                "Playlist songs retrieved successfully",
                page,
                httpRequest.getRequestURI()));
    }
}
