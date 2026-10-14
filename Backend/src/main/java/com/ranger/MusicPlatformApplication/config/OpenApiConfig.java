package com.ranger.MusicPlatformApplication.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI musicPlatformOpenAPI() {
        final String bearerSchemeName = "bearerAuth";
        final String cookieSchemeName = "cookieAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Ad-Free Personal Music Platform API")
                        .description("REST API for ad-free music streaming backend with Cloudinary media storage, PostgreSQL, and Brevo OTP admin authentication.")
                        .version("v1.0.0")
                        .contact(new Contact().name("Music Platform Administrator")))
                .addSecurityItem(new SecurityRequirement().addList(bearerSchemeName).addList(cookieSchemeName))
                .components(new Components()
                        .addSecuritySchemes(bearerSchemeName,
                                new SecurityScheme()
                                        .name(bearerSchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Provide your admin JWT access token"))
                        .addSecuritySchemes(cookieSchemeName,
                                new SecurityScheme()
                                        .name("access_token")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .description("HTTP-only cookie authentication")));
    }
}
