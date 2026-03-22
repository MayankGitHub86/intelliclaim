import sys
import os
from pathlib import Path
import re
from typing import Dict, Any

# Add app directory to path
sys.path.append(str(Path(__file__).parent))

# Import the ML service and AI service (we'll manually test enrichment)
from app.services.ml_models import ic_ml_service

class MockAIService:
    def _enrich_with_ml(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to enrich AI results with specialized ML model insights - Copied logic from ai_service.py"""
        try:
            amount_val = 0
            try:
                cleaned_amount = re.sub(r'[^\d.]', '', str(analysis_result.get('amount', '0')))
                amount_val = float(cleaned_amount) if cleaned_amount else 0
            except: pass

            ml_fraud_result = ic_ml_service.predict_fraud_risk(
                amount=amount_val,
                prev_claims=0, 
                gap_days=30,
                has_witness=True if "witness" in str(analysis_result).lower() else False,
                is_urgent=True if "urgent" in str(analysis_result).lower() or "emergency" in str(analysis_result).lower() else False
            )
            
            ml_payout_result = ic_ml_service.predict_optimal_payout(
                claimed_amount=amount_val,
                risk_score=ml_fraud_result['risk_score']
            )

            analysis_result["ml_insights"] = {
                "fraud_risk": ml_fraud_result,
                "payout_prediction": ml_payout_result,
                "confidence_score": round((float(analysis_result.get('confidence', 50)) + (1.0 - ml_fraud_result['risk_score']) * 100) / 2, 1)
            }
            return analysis_result
        except Exception as e:
            print(f"Error in enrichment: {e}")
            return analysis_result

def test_logic():
    with open("test_results.log", "w") as f:
        f.write("Executing Mocked ML Enrichment Verification...\n")
        service = MockAIService()
        
        # Scenario 1: High Amount, Urgent, No Witness (High Risk)
        case1 = {
            "amount": "₹800,000",
            "decision": "UNDER_REVIEW",
            "confidence": 85.0,
            "justification": "Urgent claim with no witness."
        }
        enriched1 = service._enrich_with_ml(case1)
        
        f.write("\nCase 1 (High Risk):\n")
        f.write(f"  - Fraud Probability: {enriched1['ml_insights']['fraud_risk']['probability']}%\n")
        f.write(f"  - Risk Level: {enriched1['ml_insights']['fraud_risk']['level']}\n")
        f.write(f"  - Predicted Payout: {enriched1['ml_insights']['payout_prediction']['predicted_amount']}\n")
        f.write(f"  - Combined Confidence: {enriched1['ml_insights']['confidence_score']}%\n")

        # Scenario 2: Low Amount, Witness, Normal (Low Risk)
        case2 = {
            "amount": "₹5,000",
            "decision": "APPROVED",
            "confidence": 92.0,
            "justification": "Small claim with witness documentation."
        }
        enriched2 = service._enrich_with_ml(case2)
        
        f.write("\nCase 2 (Low Risk):\n")
        f.write(f"  - Fraud Probability: {enriched2['ml_insights']['fraud_risk']['probability']}%\n")
        f.write(f"  - Risk Level: {enriched2['ml_insights']['fraud_risk']['level']}\n")
        f.write(f"  - Predicted Payout: {enriched2['ml_insights']['payout_prediction']['predicted_amount']}\n")
        f.write(f"  - Combined Confidence: {enriched2['ml_insights']['confidence_score']}%\n")

        # Verify logic
        f.write(f"\nVerifying: {enriched1['ml_insights']['fraud_risk']['level']} == HIGH and {enriched2['ml_insights']['fraud_risk']['level']} == LOW\n")
        
        if enriched1['ml_insights']['fraud_risk']['level'] != "HIGH" or enriched2['ml_insights']['fraud_risk']['level'] != "LOW":
            f.write("\nâ Œ Logic verification FAILED!\n")
        else:
            f.write("\nâœ… Logic verification PASSED!\n")

if __name__ == "__main__":
    test_logic()

if __name__ == "__main__":
    test_logic()
