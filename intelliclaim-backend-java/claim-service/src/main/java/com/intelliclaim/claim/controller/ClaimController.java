package com.intelliclaim.claim.controller;

import com.intelliclaim.claim.model.Claim;
import com.intelliclaim.claim.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService service;

    @GetMapping("/")
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(service.getAllClaims());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaim(@PathVariable String id) {
        return ResponseEntity.ok(service.getClaim(id));
    }

    @PostMapping("/")
    public ResponseEntity<Claim> createClaim(@RequestBody Claim claim) {
        // In a real scenario, we'd extract userId from the JWT token here
        return ResponseEntity.ok(service.createClaim(claim));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Claim> updateClaim(@PathVariable String id, @RequestBody Claim claim) {
        return ResponseEntity.ok(service.updateClaim(id, claim));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable String id) {
        service.deleteClaim(id);
        return ResponseEntity.ok().build();
    }
}
