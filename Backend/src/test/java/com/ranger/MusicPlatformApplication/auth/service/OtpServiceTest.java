package com.ranger.MusicPlatformApplication.auth.service;

import com.ranger.MusicPlatformApplication.auth.entity.OtpChallenge;
import com.ranger.MusicPlatformApplication.auth.repository.OtpChallengeRepository;
import com.ranger.MusicPlatformApplication.common.exception.RateLimitException;
import com.ranger.MusicPlatformApplication.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpChallengeRepository otpRepository;

    @InjectMocks
    private OtpService otpService;

    private final String secretKey = "b6e02b69bc0b7e0e53a27f62b226b5ae0ce6ad0144e1b50c1761d8d2c10ea83a";
    private final String testEmail = "admin@example.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(otpService, "hmacSecret", secretKey);
        ReflectionTestUtils.setField(otpService, "expirationSeconds", 300);
        ReflectionTestUtils.setField(otpService, "maxAttempts", 5);
        ReflectionTestUtils.setField(otpService, "resendCooldownSeconds", 60);
    }

    @Test
    @DisplayName("Should generate a valid 6-digit numeric OTP")
    void testGenerateOtp() {
        String otp = otpService.generateSecureOtp();
        assertNotNull(otp);
        assertEquals(6, otp.length());
        assertTrue(otp.matches("^\\d{6}$"));
    }

    @Test
    @DisplayName("HMAC-SHA256 hashing should be deterministic and verifiable")
    void testHmacHashing() {
        String rawOtp = "123456";
        String hash1 = otpService.hashOtp(rawOtp);
        String hash2 = otpService.hashOtp(rawOtp);

        assertNotNull(hash1);
        assertEquals(hash1, hash2);
        assertTrue(otpService.verifyOtpHash(rawOtp, hash1));
        assertFalse(otpService.verifyOtpHash("654321", hash1));
    }

    @Test
    @DisplayName("Should reject verification if challenge has expired")
    void testExpiredChallenge() {
        UUID challengeId = UUID.randomUUID();
        OtpChallenge expiredChallenge = OtpChallenge.builder()
                .id(challengeId)
                .email(testEmail)
                .otpHash(otpService.hashOtp("123456"))
                .expiresAt(Instant.now().minusSeconds(10))
                .attemptCount(0)
                .build();

        when(otpRepository.findById(challengeId)).thenReturn(Optional.of(expiredChallenge));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                otpService.verifyAndConsumeChallenge(challengeId, testEmail, "123456"));
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Should reject verification if challenge has already been consumed")
    void testAlreadyConsumedChallenge() {
        UUID challengeId = UUID.randomUUID();
        OtpChallenge consumedChallenge = OtpChallenge.builder()
                .id(challengeId)
                .email(testEmail)
                .otpHash(otpService.hashOtp("123456"))
                .expiresAt(Instant.now().plusSeconds(200))
                .consumedAt(Instant.now().minusSeconds(50))
                .attemptCount(1)
                .build();

        when(otpRepository.findById(challengeId)).thenReturn(Optional.of(consumedChallenge));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                otpService.verifyAndConsumeChallenge(challengeId, testEmail, "123456"));
        assertTrue(ex.getMessage().contains("already been used"));
    }

    @Test
    @DisplayName("Should increment attempts and lock after 5 failed attempts")
    void testMaxAttemptsReached() {
        UUID challengeId = UUID.randomUUID();
        OtpChallenge challenge = OtpChallenge.builder()
                .id(challengeId)
                .email(testEmail)
                .otpHash(otpService.hashOtp("123456"))
                .expiresAt(Instant.now().plusSeconds(200))
                .attemptCount(4)
                .build();

        when(otpRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        RateLimitException ex = assertThrows(RateLimitException.class, () ->
                otpService.verifyAndConsumeChallenge(challengeId, testEmail, "999999"));
        assertTrue(ex.getMessage().contains("Maximum verification attempts exceeded"));
        assertEquals(5, challenge.getAttemptCount());
        verify(otpRepository).save(challenge);
    }

    @Test
    @DisplayName("Should enforce resend cooldown if requested within cooldown period")
    void testResendCooldownEnforcement() {
        OtpChallenge existingRecent = OtpChallenge.builder()
                .email(testEmail)
                .createdAt(Instant.now().minusSeconds(20))
                .consumedAt(null)
                .build();

        when(otpRepository.findTopByEmailOrderByCreatedAtDesc(testEmail)).thenReturn(Optional.of(existingRecent));

        RateLimitException ex = assertThrows(RateLimitException.class, () ->
                otpService.createChallenge(testEmail, "123456"));
        assertTrue(ex.getMessage().contains("Please wait"));
    }
}
