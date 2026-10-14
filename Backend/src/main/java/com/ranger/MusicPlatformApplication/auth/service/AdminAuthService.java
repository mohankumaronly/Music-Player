package com.ranger.MusicPlatformApplication.auth.service;

import com.ranger.MusicPlatformApplication.audit.entity.AuditLog;
import com.ranger.MusicPlatformApplication.audit.repository.AuditLogRepository;
import com.ranger.MusicPlatformApplication.auth.dto.AuthResponse;
import com.ranger.MusicPlatformApplication.auth.dto.RequestOtpResponse;
import com.ranger.MusicPlatformApplication.auth.dto.VerifyOtpRequest;
import com.ranger.MusicPlatformApplication.auth.entity.OtpChallenge;
import com.ranger.MusicPlatformApplication.common.exception.UnauthorizedException;
import com.ranger.MusicPlatformApplication.email.BrevoEmailService;
import com.ranger.MusicPlatformApplication.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);

    @Value("${app.admin-email}")
    private String adminEmail;

    private final OtpService otpService;
    private final BrevoEmailService emailService;
    private final JwtService jwtService;
    private final AuditLogRepository auditLogRepository;

    public record VerifyResult(AuthResponse response, ResponseCookie cookie) {}

    public AdminAuthService(OtpService otpService,
                            BrevoEmailService emailService,
                            JwtService jwtService,
                            AuditLogRepository auditLogRepository) {
        this.otpService = otpService;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.auditLogRepository = auditLogRepository;
    }

    public RequestOtpResponse requestOtp(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        String configuredAdmin = adminEmail != null ? adminEmail.trim().toLowerCase() : "";

        // Constant-time style behavior to avoid user enumeration
        if (!configuredAdmin.equalsIgnoreCase(normalizedEmail)) {
            log.warn("OTP requested for non-admin email: {}", normalizedEmail);
            // Return fake challenge ID so caller cannot distinguish whether email exists
            return RequestOtpResponse.builder()
                    .challengeId(UUID.randomUUID())
                    .expiresInSeconds(otpService.getExpirationSeconds())
                    .resendAvailableInSeconds(otpService.getResendCooldownSeconds())
                    .build();
        }

        String otp = otpService.generateSecureOtp();
        OtpChallenge challenge = otpService.createChallenge(normalizedEmail, otp);

        emailService.sendOtpEmail(normalizedEmail, otp, otpService.getExpirationSeconds());

        auditLogRepository.save(AuditLog.builder()
                .action("ADMIN_OTP_REQUESTED")
                .resourceType("AUTH")
                .resourceId(challenge.getId().toString())
                .details("Admin OTP issued for " + normalizedEmail)
                .build());

        return RequestOtpResponse.builder()
                .challengeId(challenge.getId())
                .expiresInSeconds(otpService.getExpirationSeconds())
                .resendAvailableInSeconds(otpService.getResendCooldownSeconds())
                .build();
    }

    public VerifyResult verifyOtp(VerifyOtpRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String configuredAdmin = adminEmail != null ? adminEmail.trim().toLowerCase() : "";

        if (!configuredAdmin.equalsIgnoreCase(normalizedEmail)) {
            throw new UnauthorizedException("Invalid credentials.");
        }

        otpService.verifyAndConsumeChallenge(request.getChallengeId(), normalizedEmail, request.getOtp().trim());

        String jwt = jwtService.generateToken(normalizedEmail, "ADMIN");
        ResponseCookie cookie = jwtService.createAccessTokenCookie(jwt);

        auditLogRepository.save(AuditLog.builder()
                .action("ADMIN_LOGIN_SUCCESS")
                .resourceType("AUTH")
                .resourceId(request.getChallengeId().toString())
                .details("Admin logged in successfully from " + normalizedEmail)
                .build());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getExpirationSeconds())
                .role("ADMIN")
                .build();

        return new VerifyResult(authResponse, cookie);
    }

    public ResponseCookie createLogoutCookie() {
        return jwtService.createCleanAccessTokenCookie();
    }
}
