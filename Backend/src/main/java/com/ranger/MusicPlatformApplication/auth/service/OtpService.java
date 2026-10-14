package com.ranger.MusicPlatformApplication.auth.service;

import com.ranger.MusicPlatformApplication.auth.entity.OtpChallenge;
import com.ranger.MusicPlatformApplication.auth.repository.OtpChallengeRepository;
import com.ranger.MusicPlatformApplication.common.exception.RateLimitException;
import com.ranger.MusicPlatformApplication.common.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.jwt.secret}")
    private String hmacSecret;

    @Value("${app.otp.expiration-seconds:300}")
    private int expirationSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    private final OtpChallengeRepository otpRepository;

    public OtpService(OtpChallengeRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public String generateSecureOtp() {
        int code = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    public String hashOtp(String otp) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256 OTP hash", ex);
        }
    }

    public boolean verifyOtpHash(String rawOtp, String expectedHash) {
        String computedHash = hashOtp(rawOtp);
        return MessageDigest.isEqual(
                computedHash.getBytes(StandardCharsets.UTF_8),
                expectedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Transactional
    public OtpChallenge createChallenge(String normalizedEmail, String rawOtp) {
        // Enforce resend cooldown
        Optional<OtpChallenge> latestChallenge = otpRepository.findTopByEmailOrderByCreatedAtDesc(normalizedEmail);
        if (latestChallenge.isPresent()) {
            OtpChallenge previous = latestChallenge.get();
            if (previous.getConsumedAt() == null) {
                long secondsSinceCreation = Duration.between(previous.getCreatedAt(), Instant.now()).getSeconds();
                if (secondsSinceCreation < resendCooldownSeconds) {
                    long remainingSeconds = resendCooldownSeconds - secondsSinceCreation;
                    throw new RateLimitException("Please wait " + remainingSeconds + " seconds before requesting another verification code.");
                }
            }
        }

        // Invalidate any previously unconsumed challenges for this email
        otpRepository.invalidateActiveChallengesForEmail(normalizedEmail, Instant.now());

        // Create new challenge record
        OtpChallenge challenge = OtpChallenge.builder()
                .email(normalizedEmail)
                .otpHash(hashOtp(rawOtp))
                .expiresAt(Instant.now().plusSeconds(expirationSeconds))
                .attemptCount(0)
                .build();

        return otpRepository.save(challenge);
    }

    @Transactional
    public void verifyAndConsumeChallenge(UUID challengeId, String normalizedEmail, String rawOtp) {
        OtpChallenge challenge = otpRepository.findById(challengeId)
                .orElseThrow(() -> new UnauthorizedException("Invalid authentication challenge."));

        if (!challenge.getEmail().equalsIgnoreCase(normalizedEmail)) {
            throw new UnauthorizedException("Email does not match the active challenge.");
        }

        if (challenge.isConsumed()) {
            throw new UnauthorizedException("Verification code has already been used. Please request a new code.");
        }

        if (challenge.isExpired()) {
            throw new UnauthorizedException("Verification code has expired. Please request a new code.");
        }

        if (challenge.getAttemptCount() >= maxAttempts) {
            throw new RateLimitException("Maximum verification attempts exceeded. Please request a new code.");
        }

        if (!verifyOtpHash(rawOtp, challenge.getOtpHash())) {
            int newAttemptCount = challenge.getAttemptCount() + 1;
            challenge.setAttemptCount(newAttemptCount);
            otpRepository.save(challenge);

            int remainingAttempts = maxAttempts - newAttemptCount;
            if (remainingAttempts <= 0) {
                throw new RateLimitException("Maximum verification attempts exceeded. Please request a new code.");
            } else {
                throw new UnauthorizedException("Incorrect verification code. " + remainingAttempts + " attempt(s) remaining.");
            }
        }

        // Atomically consume challenge
        int rowsUpdated = otpRepository.markConsumedAtomic(challenge.getId(), Instant.now());
        if (rowsUpdated == 0) {
            throw new UnauthorizedException("Verification code has already been used.");
        }

        log.info("Successfully verified and consumed OTP challenge {} for email {}", challengeId, normalizedEmail);
    }

    public int getExpirationSeconds() {
        return expirationSeconds;
    }

    public int getResendCooldownSeconds() {
        return resendCooldownSeconds;
    }
}
