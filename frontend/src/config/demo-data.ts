// Demo Strategy: Pre-cached results for instant responses during presentation
export const DEMO_CONFIG = {
  isDemo: true, // Set to false for real processing
  instantResponse: true,
  showProcessingAnimation: true, // Visual feedback even with cached results
  processingDuration: 3000, // 3 seconds of "processing" animation
};

// Pre-cached analysis results for different demo scenarios
export const DEMO_RESULTS = {
  // Scenario 1: Car Accident - Minor Damage
  carAccidentMinor: {
    documentType: "vehicle_damage_claim",
    confidence: 0.94,
    claimAmount: 200000,
    recommendation: "APPROVE",
    processingTime: "2.8s",
    analysis: {
      damageDetection: {
        detected: true,
        severity: "minor",
        location: "rear_bumper",
        confidence: 0.92,
        estimatedCost: 200000,
        repairability: "easily_repairable"
      },
      policyCheck: {
        valid: true,
        coverage: "comprehensive",
        deductible: 40000,
        maxCoverage: 4000000,
        policyNumber: "POL-2024-VH-001234"
      },
      fraudDetection: {
        riskLevel: "low",
        confidence: 0.95,
        indicators: [],
        recommendation: "proceed"
      },
      extractedText: [
        "Policy Number: POL-2024-VH-001234",
        "Incident Date: September 20, 2025",
        "Location: Downtown Parking Lot",
        "Damage: Rear bumper scratches and dents",
        "Estimated Cost: ₹2,00,000"
      ]
    },
    explanation: "Minor rear-end collision damage detected. Policy is valid with comprehensive coverage. No fraud indicators found. Damage is consistent with reported incident.",
    nextSteps: [
      "Schedule repair estimate verification",
      "Approve payment minus ₹40,000 deductible",
      "Close claim within 24 hours"
    ]
  },

  // Scenario 2: Home Insurance - Water Damage
  waterDamage: {
    documentType: "property_damage_claim",
    confidence: 0.89,
    claimAmount: 1200000,
    recommendation: "REQUIRES_INSPECTION",
    processingTime: "3.2s",
    analysis: {
      damageDetection: {
        detected: true,
        severity: "moderate",
        location: "basement_ceiling",
        confidence: 0.88,
        estimatedCost: 1200000,
        damageType: "water_damage"
      },
      policyCheck: {
        valid: true,
        coverage: "homeowners",
        deductible: 80000,
        maxCoverage: 24000000,
        policyNumber: "POL-2024-HO-005678"
      },
      fraudDetection: {
        riskLevel: "medium",
        confidence: 0.72,
        indicators: ["recent_policy_change", "high_claim_amount"],
        recommendation: "investigate"
      },
      extractedText: [
        "Policy Number: POL-2024-HO-005678",
        "Incident Date: September 18, 2025",
        "Location: 123 Main Street, Basement",
        "Damage: Water damage to ceiling and flooring",
        "Estimated Cost: ₹12,00,000"
      ]
    },
    explanation: "Water damage detected in basement area. Policy recently modified. Moderate fraud risk requires inspection before approval.",
    nextSteps: [
      "Schedule on-site inspection",
      "Verify cause of water damage",
      "Review recent policy modifications",
      "Pending inspection results"
    ]
  },

  // Scenario 3: Health Insurance - Medical Bills
  medicalClaim: {
    documentType: "medical_claim",
    confidence: 0.96,
    claimAmount: 256000,
    recommendation: "APPROVE",
    processingTime: "1.9s",
    analysis: {
      documentVerification: {
        authentic: true,
        provider: "verified",
        procedures: "covered",
        confidence: 0.96
      },
      policyCheck: {
        valid: true,
        coverage: "health_premium",
        deductible: 20000,
        maxCoverage: 8000000,
        policyNumber: "POL-2024-HL-009876"
      },
      fraudDetection: {
        riskLevel: "low",
        confidence: 0.94,
        indicators: [],
        recommendation: "proceed"
      },
      extractedText: [
        "Provider: Apollo Hospitals Delhi",
        "Service Date: September 15, 2025",
        "Procedure: Emergency Room Visit",
        "Diagnosis Code: Z51.11",
        "Total Amount: ₹2,56,000.00"
      ]
    },
    explanation: "Legitimate emergency room visit. All procedures covered under premium health plan. Provider verified and in-network.",
    nextSteps: [
      "Process payment to provider",
      "Apply ₹20,000 deductible",
      "Send explanation of benefits to member"
    ]
  }
};

// Demo scenarios for easy selection during presentation
export const DEMO_SCENARIOS = [
  {
    id: "car_minor",
    title: "🚗 Car Accident - Minor Damage",
    description: "Rear-end collision with minor bumper damage",
    imageUrl: "/demo/car-damage-minor.jpg",
    expectedResult: "APPROVE",
    severity: "low",
    amount: "₹2,00,000"
  },
  {
    id: "water_damage",
    title: "🏠 Home Insurance - Water Damage", 
    description: "Basement ceiling water damage claim",
    imageUrl: "/demo/water-damage.jpg",
    expectedResult: "INSPECT",
    severity: "medium",
    amount: "₹12,00,000"
  },
  {
    id: "medical",
    title: "🏥 Medical Claim - ER Visit",
    description: "Emergency room visit and treatment",
    imageUrl: "/demo/medical-bill.jpg",
    expectedResult: "APPROVE",
    severity: "low", 
    amount: "₹2,56,000"
  }
];

// Simulated processing steps for realistic demo
export const PROCESSING_STEPS = [
  { step: "Uploading document...", duration: 500, progress: 10 },
  { step: "Extracting text with OCR...", duration: 800, progress: 25 },
  { step: "Analyzing with AI vision...", duration: 1000, progress: 50 },
  { step: "Checking policy database...", duration: 600, progress: 70 },
  { step: "Running fraud detection...", duration: 700, progress: 85 },
  { step: "Generating recommendation...", duration: 400, progress: 100 }
];
