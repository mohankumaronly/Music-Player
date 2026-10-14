package com.ranger.MusicPlatformApplication.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads key-value pairs from a local .env file into the Spring Environment
 * and System properties before application configuration files are processed.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DotenvEnvironmentPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path workingDir = Paths.get("").toAbsolutePath();
        File envFile = workingDir.resolve(".env").toFile();

        if (!envFile.exists()) {
            File parentEnv = workingDir.getParent() != null ? workingDir.getParent().resolve(".env").toFile() : null;
            if (parentEnv != null && parentEnv.exists()) {
                envFile = parentEnv;
            }
        }

        if (envFile.exists() && envFile.isFile()) {
            try {
                Dotenv dotenv = Dotenv.configure()
                        .directory(envFile.getParent())
                        .filename(envFile.getName())
                        .ignoreIfMissing()
                        .ignoreIfMalformed()
                        .load();

                Map<String, Object> envMap = new HashMap<>();
                for (DotenvEntry entry : dotenv.entries()) {
                    envMap.put(entry.getKey(), entry.getValue());
                    // Also populate system property if not already present
                    if (System.getProperty(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                }

                if (!envMap.isEmpty()) {
                    environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));
                    log.info("Successfully loaded {} properties from .env file into Environment and System properties", envMap.size());
                }
            } catch (Exception ex) {
                log.warn("Failed to load .env file from {}: {}", envFile.getAbsolutePath(), ex.getMessage());
            }
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
