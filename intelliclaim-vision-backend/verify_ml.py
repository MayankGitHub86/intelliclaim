import sys
import os
from pathlib import Path

# Add app directory to path
sys.path.append(str(Path(__file__).parent))

try:
    from app.services.ai_service import enhanced_ai_service
    import logging

    logging.basicConfig(level=logging.INFO)

    def test_ml_integration():
        print("Testing ML Integration in AI Service...")
        
        # Test text analysis
        test_text = "Claim for car accident. Amount: 50000. Witness present. Urgent processing needed."
        result = enhanced_ai_service.analyze_insurance_document(
            document_text=test_text,
            user_query="Analyze if this is fraud"
        )
        
        print(f"Decision: {result.get('decision')}")
        print(f"Confidence: {result.get('confidence')}%")
        
        if "ml_insights" in result:
            print("âœ… ML Insights found!")
            insights = result["ml_insights"]
            print(f"  - Fraud Level: {insights['fraud_risk']['level']}")
            print(f"  - Fraud Prob: {insights['fraud_risk']['probability']}%")
            print(f"  - Predicted Payout: {insights['payout_prediction']['predicted_amount']}")
            print(f"  - Combined Confidence: {insights['confidence_score']}%")
        else:
            print("â Œ ML Insights NOT found in result.")

    if __name__ == "__main__":
        # Set dummy env vars for testing if not present
        os.environ.setdefault("GEMINI_API_KEY", "dummy")
        test_ml_integration()

except Exception as e:
    print(f"Error during verification: {e}")
    import traceback
    traceback.print_exc()
