package com.ranger.MusicPlatformApplication.playlist.controller;

import com.ranger.MusicPlatformApplication.common.ApiResponse;
import com.ranger.MusicPlatformApplication.common.PageResponse;
import com.ranger.MusicPlatformApplication.playlist.dto.PlaylistResponse;
import com.ranger.MusicPlatformApplication.playlist.dto.PlaylistSongItemResponse;
import com.ranger.MusicPlatformApplication.playlist.service.PlaylistService;
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
@RequestMapping("/api/v1/playlists")
@Tag(name = "Public Playlists", description = "Public endpoints for exploring curated playlists")
public class PublicPlaylistController {

    private final PlaylistService playlistService;

    public PublicPlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @GetMapping
    @Operation(summary = "List public playlists", description = "Retrieves a paginated list of publicly accessible playlists.")
    public ResponseEntity<ApiResponse<PageResponse<PlaylistResponse>>> getPublicPlaylists(
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<PlaylistResponse> page = PageResponse.from(playlistService.getPublicPlaylists(pageable));
        return ResponseEntity.ok(ApiResponse.success("Playlists retrieved successfully", page, httpRequest.getRequestURI()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get playlist with songs", description = "Retrieves details of a public playlist along with its ordered songs.")
    public ResponseEntity<ApiResponse<PlaylistResponse>> getPlaylistById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {

        PlaylistResponse playlist = playlistService.getPublicPlaylistById(id);
        return ResponseEntity.ok(ApiResponse.success("Playlist retrieved successfully", playlist, httpRequest.getRequestURI()));
    }

    @GetMapping("/{id}/songs")
    @Operation(summary = "Fetch songs in a playlist", description = "Returns a paginated list of songs within a public playlist.")
    public ResponseEntity<ApiResponse<PageResponse<PlaylistSongItemResponse>>> getPlaylistSongs(
            @PathVariable UUID id,
            @PageableDefault(page = 0, size = 20, sort = "position", direction = Sort.Direction.ASC) Pageable pageable,
            HttpServletRequest httpRequest) {

        PageResponse<PlaylistSongItemResponse> page = PageResponse.from(playlistService.getPublicPlaylistSongs(id, pageable));
        return ResponseEntity.ok(ApiResponse.success("Playlist songs retrieved successfully", page, httpRequest.getRequestURI()));
    }
}
