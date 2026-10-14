package com.ranger.MusicPlatformApplication.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class BrevoEmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailService.class);

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender-email:noreply@musicplatform.com}")
    private String senderEmail;

    @Value("${brevo.sender-name:My Music Platform}")
    private String senderName;

    private final RestClient restClient;

    public BrevoEmailService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.brevo.com/v3")
                .build();
    }

    public void sendOtpEmail(String recipientEmail, String otp, int validitySeconds) {
        int validityMinutes = validitySeconds / 60;

        // Print prominently to log for immediate visibility and testing
        log.info("=================================================================");
        log.info(">>> ADMIN OTP GENERATED FOR [{}]: [{}] <<<", recipientEmail, otp);
        log.info(">>> Valid for {} minutes <<<", validityMinutes);
        log.info("=================================================================");

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("BREVO_API_KEY is not configured. Email will not be dispatched to Brevo API.");
            return;
        }

        try {
            Map<String, Object> sender = Map.of(
                    "name", senderName,
                    "email", senderEmail
            );

            Map<String, Object> recipient = Map.of(
                    "email", recipientEmail
            );

            String htmlContent = buildOtpHtmlContent(otp, validityMinutes);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", sender);
            payload.put("to", Collections.singletonList(recipient));
            payload.put("subject", "Your Admin Verification Code: " + otp);
            payload.put("htmlContent", htmlContent);

            String response = restClient.post()
                    .uri("/smtp/email")
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            log.info("Brevo email dispatched successfully to {}. Response: {}", recipientEmail, response);
        } catch (Exception ex) {
            log.error("Failed to send OTP email via Brevo API to {}: {}", recipientEmail, ex.getMessage());
            // Do not break the auth flow on external email provider network hiccups during development
        }
    }

    private String buildOtpHtmlContent(String otp, int validityMinutes) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;'>" +
                "<div style='max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>" +
                "<h2 style='color: #4f46e5; margin-bottom: 20px; text-align: center;'>Music Platform Admin Login</h2>" +
                "<p style='font-size: 16px; line-height: 1.5;'>You requested a one-time verification code to log into the Music Platform administrator dashboard.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<span style='display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827; background: #f3f4f6; padding: 12px 24px; border-radius: 6px; border: 1px dashed #cbd5e1;'>" +
                otp + "</span>" +
                "</div>" +
                "<p style='font-size: 14px; color: #64748b;'>This code expires in <strong>" + validityMinutes + " minutes</strong> and can only be used once.</p>" +
                "<p style='font-size: 14px; color: #64748b;'>If you did not request this login attempt, please disregard this email.</p>" +
                "<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;'/>" +
                "<p style='font-size: 12px; color: #94a3b8; text-align: center;'>Ad-Free Personal Music Platform Security</p>" +
                "</div></body></html>";
    }
}
