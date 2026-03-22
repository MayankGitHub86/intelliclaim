package com.intelliclaim.claim.repository;

import com.intelliclaim.claim.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, String> {
    List<Claim> findByUserId(String userId);
}
