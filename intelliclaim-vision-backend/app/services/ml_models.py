import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
import pickle
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class IntelliClaimML:
    def __init__(self):
        self.fraud_model = None
        self.payout_model = None
        self._initialize_models()

    def _initialize_models(self):
        """
        Initialize simple models for demonstration.
        In a real-world scenario, these would be loaded from pre-trained weights.
        """
        try:
            # Simple Fraud Model (Random Forest)
            # Features could be: [claim_amount, num_previous_claims, claim_gap_days, has_witness, is_urgent]
            # 1 = Fraud, 0 = Legitimate
            self.fraud_model = RandomForestClassifier(n_estimators=10, random_state=42)
            
            # Dummy training data for "Live" behavior
            # [Amount, PrevClaims, GapDays, Witness, Urgent]
            X_fraud = np.array([
                [1000, 1, 30, 1, 0],   # Legitimate
                [500000, 10, 2, 0, 1], # Fraud
                [5000, 0, 365, 1, 0],  # Legitimate
                [800000, 5, 1, 0, 1],  # Fraud
                [20000, 2, 90, 1, 0],  # Legitimate
                [1000000, 1, 1, 0, 1], # Fraud (New high value clear case)
                [2000, 0, 60, 1, 0]    # Legitimate
            ])
            y_fraud = np.array([0, 1, 0, 1, 0, 1, 0])
            self.fraud_model.fit(X_fraud, y_fraud)

            # Simple Payout Model (Linear Regression)
            # Predicts approved amount based on claimed amount and risk score
            self.payout_model = LinearRegression()
            X_payout = np.array([
                [1000, 0.1],
                [50000, 0.2],
                [100000, 0.5],
                [500000, 0.8],
                [20000, 0.1]
            ])
            # Target is the approval multiplier (e.g., 0.95 means 95% approved)
            y_payout = np.array([0.98, 0.95, 0.80, 0.60, 0.97])
            self.payout_model.fit(X_payout, y_payout)
            
            logger.info("IntelliClaim ML Models initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ML models: {str(e)}")

    def predict_fraud_risk(self, amount: float, prev_claims: int, gap_days: int, has_witness: bool, is_urgent: bool) -> Dict[str, Any]:
        """Predict fraud probability and risk level with XAI contributions"""
        if not self.fraud_model:
            return {"risk_score": 0.5, "level": "MEDIUM", "probability": 50.0, "contributions": []}
            
        features = np.array([[amount, prev_claims, gap_days, int(has_witness), int(is_urgent)]])
        prob = self.fraud_model.predict_proba(features)[0][1]
        
        # Calculate Local Contributions (XAI)
        # We compare features against "Legitimate" baselines
        baselines = [5000, 1, 180, 1, 0] # Typical legitimate claim
        feature_names = ["Claim Amount", "Previous Claims", "Days Since Last Claim", "Witness Presence", "Urgency Level"]
        importances = self.fraud_model.feature_importances_
        
        contributions = []
        for i, (val, baseline, name, imp) in enumerate(zip(features[0], baselines, feature_names, importances)):
            # Normalize impact (-1.0 to 1.0 scale roughly)
            if i == 0: # Amount
                impact = (val - baseline) / 500000
            elif i == 1: # Prev Claims
                impact = (val - baseline) / 5
            elif i == 2: # Gap Days
                impact = (baseline - val) / 30 # Less gap = more risk
            elif i == 3: # Witness
                impact = (baseline - val) # No witness = more risk
            else: # Urgent
                impact = (val - baseline) # Urgent = more risk
                
            contribution_score = float(np.clip(impact * imp * 2, -1, 1))
            contributions.append({
                "feature": name,
                "score": round(contribution_score, 2),
                "impact": "POSITIVE" if contribution_score > 0 else "NEGATIVE"
            })

        level = "LOW"
        if prob > 0.6:
            level = "HIGH"
        elif prob > 0.2:
            level = "MEDIUM"
            
        return {
            "risk_score": float(prob),
            "level": level,
            "probability": round(float(prob) * 100, 2),
            "contributions": sorted(contributions, key=lambda x: abs(x["score"]), reverse=True)
        }

    def predict_optimal_payout(self, claimed_amount: float, risk_score: float) -> Dict[str, Any]:
        """Predict the most likely approved payout amount"""
        if not self.payout_model:
            return {"predicted_amount": claimed_amount * 0.9, "multiplier": 0.9}
            
        features = np.array([[claimed_amount, risk_score]])
        multiplier = float(self.payout_model.predict(features)[0])
        
        # Clamp multiplier between 0 and 1
        multiplier = max(0.1, min(1.0, multiplier))
        
        return {
            "predicted_amount": round(claimed_amount * multiplier, 2),
            "payout_multiplier": round(multiplier, 2)
        }

# Global singleton
ic_ml_service = IntelliClaimML()
