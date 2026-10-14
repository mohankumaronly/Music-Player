CREATE TABLE songs (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_name VARCHAR(255) NOT NULL,
    album_name VARCHAR(255),
    genre VARCHAR(100),
    duration_seconds INTEGER,
    audio_public_id VARCHAR(255),
    audio_url TEXT,
    cover_public_id VARCHAR(255),
    cover_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_song_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED'))
);

CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist_name ON songs(artist_name);
