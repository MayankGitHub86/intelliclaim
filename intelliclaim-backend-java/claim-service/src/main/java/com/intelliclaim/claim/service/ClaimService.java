package com.intelliclaim.claim.service;

import com.intelliclaim.claim.model.Claim;
import com.intelliclaim.claim.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository repository;

    public List<Claim> getAllClaims() {
        return repository.findAll();
    }
    
    public List<Claim> getMyClaims(String userId) {
        return repository.findByUserId(userId);
    }

    public Claim getClaim(String id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Claim not found"));
    }

    public Claim createClaim(Claim claim) {
        return repository.save(claim);
    }

    public Claim updateClaim(String id, Claim claimDetails) {
        Claim claim = getClaim(id);
        claim.setTitle(claimDetails.getTitle());
        claim.setDescription(claimDetails.getDescription());
        claim.setAmount(claimDetails.getAmount());
        claim.setStatus(claimDetails.getStatus());
        return repository.save(claim);
    }

    public void deleteClaim(String id) {
        repository.deleteById(id);
    }
}
