CREATE TABLE asset_cleanup_records (
    id UUID PRIMARY KEY,
    public_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cleanup_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_asset_cleanup_status ON asset_cleanup_records(status);
CREATE INDEX idx_asset_cleanup_created_at ON asset_cleanup_records(created_at);
