package com.ranger.MusicPlatformApplication.auth.controller;

import com.ranger.MusicPlatformApplication.auth.dto.AuthResponse;
import com.ranger.MusicPlatformApplication.auth.dto.RequestOtpRequest;
import com.ranger.MusicPlatformApplication.auth.dto.RequestOtpResponse;
import com.ranger.MusicPlatformApplication.auth.dto.VerifyOtpRequest;
import com.ranger.MusicPlatformApplication.auth.service.AdminAuthService;
import com.ranger.MusicPlatformApplication.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/admin")
@Tag(name = "Authentication", description = "Administrator OTP authentication and session management")
public class AdminAuthController {

    private final AdminAuthService authService;

    public AdminAuthController(AdminAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/request-otp")
    @Operation(summary = "Request administrator login OTP", description = "Generates a 6-digit OTP and sends it to the configured administrator email.")
    public ResponseEntity<ApiResponse<RequestOtpResponse>> requestOtp(
            @Valid @RequestBody RequestOtpRequest request,
            HttpServletRequest httpRequest) {

        RequestOtpResponse data = authService.requestOtp(request.getEmail());
        ApiResponse<RequestOtpResponse> response = ApiResponse.success(
                "If the request is eligible, an OTP will be sent to the configured administrator email.",
                data,
                httpRequest.getRequestURI()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and issue session", description = "Verifies the submitted OTP, sets an HTTP-only access cookie, and returns the JWT Bearer token.")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest httpRequest) {

        AdminAuthService.VerifyResult result = authService.verifyOtp(request);
        ApiResponse<AuthResponse> response = ApiResponse.success(
                "Administrator authentication successful",
                result.response(),
                httpRequest.getRequestURI()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.cookie().toString())
                .body(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout administrator", description = "Clears the authentication cookie.")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        ApiResponse<Void> response = ApiResponse.success(
                "Administrator logged out successfully",
                null,
                httpRequest.getRequestURI()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authService.createLogoutCookie().toString())
                .body(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Check administrator authentication service health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health(
            HttpServletRequest httpRequest) {

        Map<String, String> data = new HashMap<>();
        data.put("status", "ok");
        data.put("service", "UP");

        ApiResponse<Map<String, String>> response = ApiResponse.success(
                "Administrator authentication service is running",
                data,
                httpRequest.getRequestURI()
        );

        return ResponseEntity.ok(response);
    }
}
