package com.ranger.MusicPlatformApplication.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secretKey = "b6e02b69bc0b7e0e53a27f62b226b5ae0ce6ad0144e1b50c1761d8d2c10ea83a";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", secretKey);
        ReflectionTestUtils.setField(jwtService, "expirationSeconds", 900L);
        ReflectionTestUtils.setField(jwtService, "cookieName", "access_token");
        ReflectionTestUtils.setField(jwtService, "cookieSecure", false);
        ReflectionTestUtils.setField(jwtService, "cookieSameSite", "Lax");
    }

    @Test
    @DisplayName("Should generate valid JWT with email and role claims")
    void testGenerateAndValidateToken() {
        String email = "admin@example.com";
        String token = jwtService.generateToken(email, "ADMIN");

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals(email, jwtService.extractEmail(token));
        assertEquals("ADMIN", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("Should create correct HttpOnly ResponseCookie for JWT")
    void testCreateAccessTokenCookie() {
        String token = "dummy.token.value";
        ResponseCookie cookie = jwtService.createAccessTokenCookie(token);

        assertEquals("access_token", cookie.getName());
        assertEquals(token, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertEquals("Lax", cookie.getSameSite());
        assertEquals("/", cookie.getPath());
        assertEquals(900L, cookie.getMaxAge().getSeconds());
    }

    @Test
    @DisplayName("Should create clean logout cookie with max-age 0")
    void testCreateCleanLogoutCookie() {
        ResponseCookie cookie = jwtService.createCleanAccessTokenCookie();

        assertEquals("access_token", cookie.getName());
        assertEquals("", cookie.getValue());
        assertEquals(0L, cookie.getMaxAge().getSeconds());
    }
}
