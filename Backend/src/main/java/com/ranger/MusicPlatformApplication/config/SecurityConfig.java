package com.ranger.MusicPlatformApplication.config;

import com.ranger.MusicPlatformApplication.security.AdminAuthenticationEntryPoint;
import com.ranger.MusicPlatformApplication.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AdminAuthenticationEntryPoint authenticationEntryPoint;

    /**
     * Comma-separated list of allowed origins.
     * Configured via application.properties / application.yml or env var CORS_ALLOWED_ORIGINS.
     * Defaults to local dev origins if not provided.
     */
    @Value("${app.security.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:8080}")
    private String allowedOrigins;

    /**
     * Comma-separated list of allowed HTTP methods.
     * Defaults to standard REST verbs.
     */
    @Value("${app.security.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}")
    private String allowedMethods;

    /**
     * Comma-separated list of allowed headers.
     * "*" means all headers are allowed.
     */
    @Value("${app.security.cors.allowed-headers:*}")
    private String allowedHeaders;

    /**
     * Comma-separated list of headers exposed to the browser.
     * Useful for reading Authorization or custom headers in JS.
     */
    @Value("${app.security.cors.exposed-headers:Authorization,Content-Disposition}")
    private String exposedHeaders;

    /**
     * Whether to allow credentials (cookies, Authorization header, TLS client certs).
     * Must be true for the OTP cookie flow to work.
     */
    @Value("${app.security.cors.allow-credentials:true}")
    private boolean allowCredentials;

    /**
     * How long the browser may cache the preflight response (in seconds).
     */
    @Value("${app.security.cors.max-age:3600}")
    private Long maxAge;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          AdminAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        // ---------- Public authentication endpoints ----------
                        .requestMatchers(
                                "/api/v1/auth/admin/request-otp",
                                "/api/v1/auth/admin/verify-otp"
                        ).permitAll()

                        // ---------- Public music endpoints ----------
                        .requestMatchers(HttpMethod.GET, "/api/v1/songs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/playlists/**").permitAll()

                        // ---------- Swagger / OpenAPI documentation ----------
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ---------- Health checks ----------
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        // ---------- Preflight (CORS) ----------
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---------- Admin-only endpoints ----------
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auth/admin/logout").authenticated()

                        // ---------- Anything else requires authentication ----------
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = splitCsv(allowedOrigins);
        List<String> methods = splitCsv(allowedMethods);
        List<String> headers = splitCsv(allowedHeaders);
        List<String> exposed = splitCsv(exposedHeaders);

        // If "*" is configured for origins, use allowedOriginPatterns (required when credentials=true)
        if (origins.contains("*")) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            configuration.setAllowedOrigins(origins);
        }

        configuration.setAllowedMethods(methods);
        configuration.setAllowedHeaders(headers);
        configuration.setExposedHeaders(exposed);
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }

    /**
     * Splits a comma-separated property value into a trimmed, non-empty list.
     */
    private static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}