import logging
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class CrossDocumentConsistencyEngine:
    """
    Advanced AI engine for detecting inconsistencies across multiple insurance documents.
    Used for deep fraud detection and data validation.
    """
    
    def analyze_consistency(self, analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare multiple document analyses to find conflicts.
        """
        if len(analyses) < 2:
            return {
                "is_consistent": True,
                "confidence": 100,
                "conflicts": [],
                "summary": "Need at least two documents for cross-referencing."
            }

        conflicts = []
        
        # 1. Date Consistency Check
        dates = []
        for a in analyses:
            ext = a.get("extracted_info", {})
            if ext.get("incident_date"):
                dates.append({"id": a.get("document_id", "Unknown"), "date": ext["incident_date"]})
            elif ext.get("claim_date"):
                dates.append({"id": a.get("document_id", "Unknown"), "date": ext["claim_date"]})

        if len(set(d["date"] for d in dates)) > 1:
            conflicts.append({
                "type": "DATE_MISMATCH",
                "severity": "HIGH",
                "message": f"Mismatched incident dates found across documents: {', '.join(set(d['date'] for d in dates))}",
                "affected_docs": [d["id"] for d in dates]
            })

        # 2. Amount Consistency Check (e.g. Bill amount vs Claim amount)
        # In a real app, we'd compare 'Invoice Total' with 'Claimed Amount'
        
        # 3. Policy Holder Check
        names = []
        for a in analyses:
            ext = a.get("extracted_info", {})
            if ext.get("claimant_name"):
                names.append(ext["claimant_name"].lower())
        
        if len(set(names)) > 1:
            conflicts.append({
                "type": "IDENTICAL_ENTITY_MISMATCH",
                "severity": "MEDIUM",
                "message": f"Different names found for the primary claimant: {', '.join(set(names))}",
                "affected_docs": [a.get("document_id") for a in analyses]
            })

        is_consistent = len(conflicts) == 0
        risk_level = "LOW" if is_consistent else ("HIGH" if any(c["severity"] == "HIGH" for c in conflicts) else "MEDIUM")

        return {
            "is_consistent": is_consistent,
            "risk_level": risk_level,
            "conflicts": conflicts,
            "summary": "Cross-document validation successful. No major conflicts found." if is_consistent else f"Detected {len(conflicts)} inconsistencies across documents.",
            "timestamp": datetime.now().isoformat()
        }

cross_ref_engine = CrossDocumentConsistencyEngine()
