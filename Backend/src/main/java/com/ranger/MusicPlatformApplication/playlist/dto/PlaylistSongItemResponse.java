package com.ranger.MusicPlatformApplication.playlist.dto;

import com.ranger.MusicPlatformApplication.playlist.entity.PlaylistSong;
import com.ranger.MusicPlatformApplication.song.entity.Song;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistSongItemResponse {

    private UUID id;
    private String title;
    private String artistName;
    private String albumName;
    private String genre;
    private Integer durationSeconds;
    private String audioUrl;
    private String coverUrl;
    private Integer position;

    public static PlaylistSongItemResponse from(PlaylistSong playlistSong) {
        Song song = playlistSong.getSong();
        return PlaylistSongItemResponse.builder()
                .id(song.getId())
                .title(song.getTitle())
                .artistName(song.getArtistName())
                .albumName(song.getAlbumName())
                .genre(song.getGenre())
                .durationSeconds(song.getDurationSeconds())
                .audioUrl(song.getAudioUrl())
                .coverUrl(song.getCoverUrl())
                .position(playlistSong.getPosition())
                .build();
    }
}
