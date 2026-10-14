package com.ranger.MusicPlatformApplication.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestOtpResponse {

    private UUID challengeId;
    private int expiresInSeconds;
    private int resendAvailableInSeconds;
}
