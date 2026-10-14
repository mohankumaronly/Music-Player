package com.ranger.MusicPlatformApplication.auth.repository;

import com.ranger.MusicPlatformApplication.auth.entity.OtpChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, UUID> {

    Optional<OtpChallenge> findTopByEmailOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("UPDATE OtpChallenge o SET o.consumedAt = :now WHERE o.email = :email AND o.consumedAt IS NULL")
    void invalidateActiveChallengesForEmail(@Param("email") String email, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE OtpChallenge o SET o.consumedAt = :now WHERE o.id = :id AND o.consumedAt IS NULL")
    int markConsumedAtomic(@Param("id") UUID id, @Param("now") Instant now);
}
