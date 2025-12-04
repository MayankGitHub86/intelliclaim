"""
Demo API endpoints for live presentation
Provides instant responses using pre-cached results
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import json
import time
import random

router = APIRouter()

# Pre-cached demo results for instant responses
DEMO_RESULTS = {
    "car_minor": {
        "document_id": "demo-car-001",
        "analysis": {
            "recommendation": "APPROVE",
            "confidence": 0.94,
            "claim_amount": 200000,
            "processing_time": "2.8s",
            "damage_detection": {
                "detected": True,
                "severity": "minor", 
                "location": "rear_bumper",
                "estimated_cost": 200000,
                "confidence": 0.92
            },
            "policy_verification": {
                "valid": True,
                "coverage_type": "comprehensive",
                "deductible": 40000,
                "max_coverage": 4000000
            },
            "fraud_analysis": {
                "risk_level": "low",
                "confidence": 0.95,
                "indicators": []
            },
            "extracted_info": {
                "policy_number": "POL-2024-VH-001234",
                "incident_date": "2025-09-20",
                "damage_type": "collision"
            }
        },
        "explanation": "Minor rear-end collision damage detected. Policy valid with comprehensive coverage. No fraud indicators.",
        "next_steps": [
            "Schedule repair estimate verification",
            "Approve payment minus ₹40,000 deductible", 
            "Close claim within 24 hours"
        ]
    },
    "water_damage": {
        "document_id": "demo-water-001",
        "analysis": {
            "recommendation": "REQUIRES_INSPECTION",
            "confidence": 0.89,
            "claim_amount": 1200000,
            "processing_time": "3.2s",
            "damage_detection": {
                "detected": True,
                "severity": "moderate",
                "location": "basement_ceiling", 
                "estimated_cost": 1200000,
                "confidence": 0.88
            },
            "policy_verification": {
                "valid": True,
                "coverage_type": "homeowners",
                "deductible": 80000,
                "max_coverage": 24000000
            },
            "fraud_analysis": {
                "risk_level": "medium",
                "confidence": 0.72,
                "indicators": ["recent_policy_change", "high_claim_amount"]
            },
            "extracted_info": {
                "policy_number": "POL-2024-HO-005678",
                "incident_date": "2025-09-18",
                "damage_type": "water_damage"
            }
        },
        "explanation": "Water damage detected. Policy recently modified. Moderate fraud risk requires inspection.",
        "next_steps": [
            "Schedule on-site inspection",
            "Verify cause of water damage",
            "Review recent policy modifications"
        ]
    },
    "medical": {
        "document_id": "demo-medical-001", 
        "analysis": {
            "recommendation": "APPROVE",
            "confidence": 0.96,
            "claim_amount": 256000,
            "processing_time": "1.9s",
            "document_verification": {
                "authentic": True,
                "provider_verified": True,
                "procedures_covered": True,
                "confidence": 0.96
            },
            "policy_verification": {
                "valid": True,
                "coverage_type": "health_premium",
                "deductible": 20000,
                "max_coverage": 8000000
            },
            "fraud_analysis": {
                "risk_level": "low",
                "confidence": 0.94,
                "indicators": []
            },
            "extracted_info": {
                "provider": "Apollo Hospitals Delhi",
                "service_date": "2025-09-15", 
                "procedure_codes": ["99283", "36415"],
                "diagnosis": "Z51.11"
            }
        },
        "explanation": "Legitimate emergency room visit. Provider verified and in-network. All procedures covered.",
        "next_steps": [
            "Process payment to provider",
            "Apply ₹20,000 deductible",
            "Send EOB to member"
        ]
    }
}

@router.get("/scenarios")
async def get_demo_scenarios():
    """Get available demo scenarios for presentation"""
    return {
        "scenarios": [
            {
                "id": "car_minor",
                "title": "🚗 Car Accident - Minor Damage",
                "description": "Rear-end collision with minor bumper damage",
                "expected_result": "APPROVE",
                "severity": "low",
                "amount": "₹2,00,000"
            },
            {
                "id": "water_damage", 
                "title": "🏠 Home Insurance - Water Damage",
                "description": "Basement ceiling water damage claim",
                "expected_result": "INSPECT", 
                "severity": "medium",
                "amount": "₹12,00,000"
            },
            {
                "id": "medical",
                "title": "🏥 Medical Claim - ER Visit", 
                "description": "Emergency room visit and treatment",
                "expected_result": "APPROVE",
                "severity": "low",
                "amount": "₹2,56,000"
            }
        ]
    }

@router.post("/analyze/{scenario_id}")
async def demo_analyze_claim(scenario_id: str, simulate_processing: bool = True):
    """
    Demo endpoint that provides instant results for presentation
    Optionally simulates processing time for realistic demo
    """
    
    if scenario_id not in DEMO_RESULTS:
        raise HTTPException(status_code=404, detail="Demo scenario not found")
    
    # Simulate processing time if requested (for realistic demo)
    if simulate_processing:
        # Add small random delay (1-3 seconds) to make it look realistic
        processing_delay = random.uniform(1.0, 3.0)
        time.sleep(processing_delay)
    
    result = DEMO_RESULTS[scenario_id].copy()
    
    # Add timestamp
    result["timestamp"] = time.time()
    result["demo_mode"] = True
    
    return {
        "success": True,
        "result": result,
        "message": f"Demo analysis completed for scenario: {scenario_id}"
    }

@router.get("/stats")
async def get_demo_stats():
    """Get demo statistics for dashboard"""
    return {
        "total_claims_processed": 15847,
        "claims_today": 234,
        "average_processing_time": "2.3s",
        "approval_rate": "87.3%",
        "fraud_detection_rate": "4.2%", 
        "cost_savings": "₹19.2 Cr",
        "processing_speed_improvement": "94%",
        "accuracy_rate": "98.7%"
    }

@router.post("/demo/upload")
async def demo_upload_document(scenario_id: str = "car_minor"):
    """
    Demo file upload endpoint - returns instant success
    """
    return {
        "success": True,
        "document_id": f"demo-{scenario_id}-{int(time.time())}",
        "filename": f"demo_{scenario_id}.jpg",
        "message": "Document uploaded successfully (demo mode)",
        "size": random.randint(50000, 200000)
    }

@router.get("/demo/health")
async def demo_health_check():
    """Demo health check - always returns healthy"""
    return {
        "status": "healthy",
        "demo_mode": True,
        "ai_services": {
            "gemini_vision": "active",
            "llm_analysis": "active", 
            "fraud_detection": "active",
            "ocr_service": "active"
        },
        "uptime": "99.9%",
        "version": "1.0.0-demo"
    }
