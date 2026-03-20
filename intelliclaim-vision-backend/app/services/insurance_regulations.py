"""
Insurance Regulations and Compliance Standards
Based on IRDAI (Insurance Regulatory and Development Authority of India) Guidelines
and International Insurance Standards
"""

# IRDAI Regulations and Guidelines
IRDAI_REGULATIONS = {
    "claim_settlement_time": {
        "health_insurance": "15 days from receipt of last document",
        "motor_insurance": "30 days from receipt of last document",
        "property_insurance": "30 days from receipt of last document",
        "life_insurance": "30 days from receipt of death certificate"
    },
    
    "mandatory_documents": {
        "health_insurance": [
            "Duly filled claim form",
            "Original hospital bills and receipts",
            "Discharge summary",
            "Investigation reports",
            "Doctor's prescription",
            "Policy copy",
            "Photo ID proof",
            "Cancelled cheque or bank details"
        ],
        "motor_insurance": [
            "Duly filled claim form",
            "RC (Registration Certificate) copy",
            "Driving license copy",
            "FIR copy (for theft/third party)",
            "Repair estimates/bills",
            "Photos of damage",
            "Survey report",
            "Policy copy"
        ],
        "property_insurance": [
            "Claim form",
            "Policy document",
            "FIR (if applicable)",
            "Photos of damage",
            "Repair estimates",
            "Property ownership proof",
            "Survey report"
        ]
    },
    
    "claim_rejection_reasons": [
        "Policy lapsed due to non-payment of premium",
        "Claim filed after policy expiry",
        "Pre-existing disease not disclosed (health)",
        "Driving without valid license (motor)",
        "Driving under influence of alcohol/drugs",
        "Intentional damage or fraud",
        "War, nuclear risks, terrorism (unless covered)",
        "Consequential losses (unless covered)",
        "Wear and tear, depreciation beyond limits",
        "Non-disclosure of material facts"
    ],
    
    "depreciation_rates": {
        "motor_vehicle_parts": {
            "rubber_plastic_nylon": "50%",
            "fiber_glass": "30%",
            "battery": "50%",
            "painting": "50% of painting cost",
            "vehicle_age_0_6_months": "Nil",
            "vehicle_age_6_12_months": "5%",
            "vehicle_age_1_2_years": "10%",
            "vehicle_age_2_3_years": "15%",
            "vehicle_age_3_4_years": "25%",
            "vehicle_age_4_5_years": "35%",
            "vehicle_age_above_5_years": "40%"
        }
    },
    
    "deductible_types": {
        "compulsory_deductible": "Mandatory as per policy terms",
        "voluntary_deductible": "Opted by policyholder for premium discount"
    },
    
    "sum_insured_limits": {
        "health_insurance": "As per policy - typically ₹1L to ₹1Cr",
        "motor_insurance": "IDV (Insured Declared Value) of vehicle",
        "property_insurance": "Market value or replacement value"
    }
}

# Insurance Act 1938 and Amendments
INSURANCE_ACT_PROVISIONS = {
    "section_45": {
        "title": "Policy not to be called in question on ground of mis-statement after three years",
        "description": "After 3 years, policy cannot be questioned except for fraud"
    },
    "section_64vb": {
        "title": "Claim settlement",
        "description": "Insurer must settle or reject claim within specified time"
    },
    "section_41": {
        "title": "Prohibition of rebates",
        "description": "No person shall offer rebates from premium"
    }
}

# IRDAI Guidelines on Claim Settlement
CLAIM_SETTLEMENT_GUIDELINES = {
    "intimation_period": {
        "health": "Within 24-48 hours of hospitalization or discharge",
        "motor": "Immediately or within 24 hours of accident",
        "property": "Immediately or within 7 days"
    },
    
    "survey_requirements": {
        "motor_above_amount": "₹50,000 - Survey mandatory",
        "property_above_amount": "₹1,00,000 - Survey mandatory",
        "health_above_amount": "₹1,00,000 - May require investigation"
    },
    
    "cashless_facility": {
        "health": "Available at network hospitals",
        "conditions": [
            "Pre-authorization required",
            "Hospital must be in network",
            "Policy must be active",
            "Waiting period completed"
        ]
    },
    
    "reimbursement_process": {
        "steps": [
            "Submit claim form with documents",
            "Insurer reviews within 15-30 days",
            "Additional documents requested if needed",
            "Claim approved/rejected with reasons",
            "Payment within 7 days of approval"
        ]
    }
}

# Standard Exclusions (Common across policies)
STANDARD_EXCLUSIONS = {
    "health_insurance": [
        "Pre-existing diseases (waiting period 2-4 years)",
        "Maternity expenses (waiting period 9 months - 4 years)",
        "Cosmetic/aesthetic treatments",
        "Dental treatment (unless due to accident)",
        "Congenital diseases (waiting period)",
        "Self-inflicted injuries",
        "War, nuclear risks",
        "Experimental treatments"
    ],
    
    "motor_insurance": [
        "Consequential loss (loss of use)",
        "Wear and tear",
        "Mechanical/electrical breakdown",
        "Driving without valid license",
        "Driving under influence",
        "Use beyond geographical limits",
        "Contractual liability",
        "War, nuclear risks"
    ],
    
    "property_insurance": [
        "Normal wear and tear",
        "Gradual deterioration",
        "War, terrorism (unless covered)",
        "Nuclear risks",
        "Consequential losses",
        "Pollution, contamination",
        "Intentional damage",
        "Existing damage"
    ]
}

# Claim Assessment Criteria
CLAIM_ASSESSMENT_CRITERIA = {
    "document_verification": {
        "authenticity_check": "Verify signatures, stamps, dates",
        "completeness_check": "All mandatory documents present",
        "consistency_check": "Information matches across documents",
        "timeline_check": "Events in logical sequence"
    },
    
    "coverage_verification": {
        "policy_active": "Policy in force at time of incident",
        "premium_paid": "All premiums paid up to date",
        "coverage_applicable": "Incident covered under policy terms",
        "sum_insured_adequate": "Claim within sum insured limits",
        "waiting_period": "Applicable waiting periods completed"
    },
    
    "incident_verification": {
        "cause_of_loss": "Verify actual cause matches claim",
        "timeline": "Incident date, intimation date, claim date",
        "location": "Incident location verification",
        "third_party": "Third party involvement if any",
        "police_report": "FIR if required by policy"
    },
    
    "financial_verification": {
        "amount_reasonableness": "Claimed amount reasonable for incident",
        "supporting_bills": "Original bills and receipts",
        "market_rates": "Costs match market rates",
        "depreciation": "Apply depreciation as per schedule",
        "deductible": "Apply policy deductible"
    }
}

# Fraud Indicators (Red Flags)
FRAUD_INDICATORS = {
    "high_risk": [
        "Multiple claims in short period",
        "Claim filed immediately after policy purchase",
        "Inconsistent statements",
        "Missing or altered documents",
        "Excessive claim amount",
        "Reluctance to provide information",
        "Previous fraud history",
        "Suspicious timing of incident"
    ],
    
    "medium_risk": [
        "Incomplete documentation",
        "Minor inconsistencies in dates/amounts",
        "Delayed intimation without reason",
        "Third party involvement unclear",
        "Unusual claim pattern",
        "Conflicting witness statements"
    ],
    
    "investigation_triggers": [
        "Claim amount > ₹5,00,000",
        "Multiple red flags present",
        "Prior claim history suspicious",
        "Third party liability involved",
        "Criminal activity suspected",
        "Policy terms unclear"
    ]
}

# Regulatory Compliance Checklist
COMPLIANCE_CHECKLIST = {
    "irdai_compliance": [
        "Claim processed within stipulated time",
        "Proper reasons given for rejection",
        "All communications documented",
        "Customer grievance mechanism informed",
        "Ombudsman details provided if rejected"
    ],
    
    "consumer_protection": [
        "Fair treatment of customer",
        "No unfair claim rejection",
        "Transparent communication",
        "Timely settlement",
        "Proper documentation"
    ],
    
    "data_protection": [
        "Customer data confidentiality",
        "Secure document handling",
        "Privacy maintained",
        "Data retention as per norms"
    ]
}

# Ombudsman and Grievance Redressal
GRIEVANCE_REDRESSAL = {
    "insurance_ombudsman": {
        "jurisdiction": "Claims up to ₹50 lakhs",
        "time_limit": "Within 1 year of insurer's rejection",
        "process": "Free of cost, binding on insurer",
        "contact": "As per regional ombudsman offices"
    },
    
    "irdai_igms": {
        "name": "Integrated Grievance Management System",
        "website": "https://igms.irda.gov.in",
        "timeline": "Insurer must respond within 15 days"
    },
    
    "consumer_forum": {
        "district_forum": "Claims up to ₹1 crore",
        "state_commission": "Claims ₹1 crore to ₹10 crore",
        "national_commission": "Claims above ₹10 crore"
    }
}

def get_applicable_regulations(claim_type: str, claim_amount: float) -> dict:
    """Get applicable regulations for a specific claim"""
    regulations = {
        "claim_type": claim_type,
        "claim_amount": f"₹{claim_amount:,.0f}",
        "settlement_timeline": IRDAI_REGULATIONS["claim_settlement_time"].get(claim_type, "30 days"),
        "mandatory_documents": IRDAI_REGULATIONS["mandatory_documents"].get(claim_type, []),
        "standard_exclusions": STANDARD_EXCLUSIONS.get(claim_type, []),
        "requires_survey": claim_amount >= 50000,
        "ombudsman_applicable": claim_amount <= 5000000,
        "compliance_requirements": COMPLIANCE_CHECKLIST["irdai_compliance"]
    }
    
    return regulations

def calculate_depreciation(vehicle_age_years: float, part_type: str = "metal") -> float:
    """Calculate depreciation as per IRDAI motor insurance guidelines"""
    depreciation_schedule = {
        (0, 0.5): 0,
        (0.5, 1): 5,
        (1, 2): 10,
        (2, 3): 15,
        (3, 4): 25,
        (4, 5): 35,
        (5, 100): 40
    }
    
    # Special parts with higher depreciation
    special_parts = {
        "rubber": 50,
        "plastic": 50,
        "nylon": 50,
        "fiber_glass": 30,
        "battery": 50
    }
    
    if part_type.lower() in special_parts:
        return special_parts[part_type.lower()]
    
    for (min_age, max_age), depreciation in depreciation_schedule.items():
        if min_age <= vehicle_age_years < max_age:
            return depreciation
    
    return 40  # Maximum depreciation

def validate_claim_timeline(incident_date: str, intimation_date: str, claim_date: str, claim_type: str) -> dict:
    """Validate if claim timeline meets regulatory requirements"""
    from datetime import datetime, timedelta
    
    try:
        incident = datetime.fromisoformat(incident_date)
        intimation = datetime.fromisoformat(intimation_date)
        claim = datetime.fromisoformat(claim_date)
        
        intimation_delay = (intimation - incident).days
        claim_delay = (claim - incident).days
        
        # Check intimation timeline
        max_intimation_days = {
            "health_insurance": 2,
            "motor_insurance": 1,
            "property_insurance": 7
        }
        
        max_allowed = max_intimation_days.get(claim_type, 7)
        intimation_compliant = intimation_delay <= max_allowed
        
        return {
            "timeline_compliant": intimation_compliant,
            "intimation_delay_days": intimation_delay,
            "claim_delay_days": claim_delay,
            "max_allowed_intimation_days": max_allowed,
            "remarks": "Compliant" if intimation_compliant else f"Delayed intimation by {intimation_delay - max_allowed} days"
        }
    except:
        return {
            "timeline_compliant": False,
            "remarks": "Unable to validate timeline - dates not provided"
        }
