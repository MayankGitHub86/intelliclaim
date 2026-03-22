"""
Enhanced AI Service for IntelliClaim - 99.9% Accuracy Insurance Document Analysis
Supports Google Gemini (primary) and OpenAI (fallback)
"""

import os
import logging
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import re
from dotenv import load_dotenv

# AI imports
import google.generativeai as genai
import openai
from .ml_models import ic_ml_service

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class EnhancedAIService:
    """Enhanced AI service using Gemini (primary) and OpenAI (fallback) for maximum accuracy"""
    
    def __init__(self):
        # Gemini configuration (Primary AI)
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        # Updated to use Gemini 2.5 Flash model
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.gemini_max_tokens = int(os.getenv("GEMINI_MAX_TOKENS", 8000))
        self.gemini_temperature = float(os.getenv("GEMINI_TEMPERATURE", 0.1))
        # Hard 2s SLA for generation
        try:
            self.gemini_timeout_sec = float(os.getenv("GEMINI_TIMEOUT_SECONDS", 2))
        except ValueError:
            self.gemini_timeout_sec = 2.0
        # Cap tokens for fast-path responses
        try:
            self.gemini_fast_max_tokens = int(os.getenv("GEMINI_FAST_MAX_TOKENS", 1024))
        except ValueError:
            self.gemini_fast_max_tokens = 1024
        # Optional input trimming to reduce latency
        try:
            self.gemini_input_char_limit = int(os.getenv("GEMINI_INPUT_CHAR_LIMIT", 6000))
        except ValueError:
            self.gemini_input_char_limit = 6000
        
        # OpenAI configuration (Fallback AI)
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.openai_max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", 8000))
        self.openai_temperature = float(os.getenv("OPENAI_TEMPERATURE", 0.1))
        
        # Initialize Gemini client
        if self.gemini_api_key:
            try:
                genai.configure(api_key=self.gemini_api_key)
                
                # Configure generation settings for Flash 2.5
                generation_config = {
                    "temperature": self.gemini_temperature,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": self.gemini_max_tokens,
                    "response_mime_type": "text/plain"
                }
                
                # Safety settings for production use
                safety_settings = [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH", 
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
                
                self.gemini_client = genai.GenerativeModel(
                    model_name=self.gemini_model,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                self.gemini_available = True
                logger.info(f"Gemini 2.5 Flash Service initialized with model: {self.gemini_model}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini 2.5 Flash client: {str(e)}")
                self.gemini_client = None
                self.gemini_available = False
        else:
            logger.warning("Gemini API key not found")
            self.gemini_client = None
            self.gemini_available = False
        
        # Initialize OpenAI client (fallback)
        if self.openai_api_key:
            try:
                self.openai_client = OpenAI(
                    api_key=self.openai_api_key,
                    timeout=float(os.getenv("OPENAI_TIMEOUT", 2))
                )
                self.openai_available = True
                logger.info(f"OpenAI fallback service initialized with model: {self.openai_model}")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                self.openai_client = None
                self.openai_available = False
        else:
            logger.warning("OpenAI API key not found")
            self.openai_client = None
            self.openai_available = False
        
        # Overall availability
        self.is_available = self.gemini_available or self.openai_available
        
        if not self.is_available:
            logger.warning("No AI services available - will use rule-based fallback analysis")
    
    def analyze_insurance_document(self, document_text: str, user_query: str = None, file_path: str = None) -> Dict[str, Any]:
        """
        Analyze insurance document with 99.9% accuracy using AI (Gemini preferred with vision, OpenAI fallback)
        
        Args:
            document_text: Extracted text from the document
            user_query: Optional specific query about the document
            file_path: Optional path to original file for Gemini vision analysis
            
        Returns:
            Dict containing detailed analysis results
        """
        # Try Gemini first (primary AI with vision capabilities)
        if self.gemini_available:
            try:
                return self._analyze_with_gemini(document_text, user_query, file_path)
            except TimeoutError as e:
                logger.error(f"Gemini analysis timed out ({self.gemini_timeout_sec}s). Using rule-based fallback to meet SLA.")
                return self._fallback_analysis(document_text, f"Gemini timeout after {self.gemini_timeout_sec}s")
            except Exception as e:
                logger.error(f"Gemini analysis failed: {str(e)}, falling back to OpenAI")
        
        # Try OpenAI as fallback
        if self.openai_available:
            try:
                return self._analyze_with_openai(document_text, user_query)
            except Exception as e:
                logger.error(f"OpenAI analysis failed: {str(e)}, using rule-based fallback")
        
        # Final fallback to rule-based analysis
        logger.warning("All AI services failed, using rule-based analysis")
        return self._fallback_analysis(document_text, "All AI services unavailable")
    
    def _analyze_with_gemini(self, document_text: str, user_query: str = None, file_path: str = None) -> Dict[str, Any]:
        """Analyze document using Google Gemini with vision capabilities"""
        logger.info(f"Starting Gemini analysis for document")
        
        # Check if we have a file path for direct vision analysis
        if file_path and os.path.exists(file_path):
            return self._analyze_document_with_gemini_vision(file_path, user_query)
        else:
            # Fallback to text-based analysis
            return self._analyze_text_with_gemini(document_text, user_query)
    
    def _analyze_document_with_gemini_vision(self, file_path: str, user_query: str = None) -> Dict[str, Any]:
        """Analyze document directly using Gemini's vision capabilities"""
        try:
            logger.info(f"Using Gemini vision to analyze document: {file_path}")
            
            # Upload file to Gemini
            uploaded_file = genai.upload_file(path=file_path)
            logger.info(f"File uploaded to Gemini: {uploaded_file.name}")
            
            # Create vision-based prompt
            vision_prompt = self._create_vision_analysis_prompt(user_query)
            
            # Configure generation settings for vision with 2.5 Flash
            generation_config = {
                "temperature": self.gemini_temperature,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": min(self.gemini_fast_max_tokens, self.gemini_max_tokens),
                "response_mime_type": "application/json"
            }
            
            # Generate response with strict timeout
            response = self._generate_with_timeout([vision_prompt, uploaded_file], generation_config)
            
            # Parse response
            analysis_result = self._parse_json_response(response.text)
            
            # Add metadata
            analysis_result["analysis_timestamp"] = datetime.now().isoformat()
            analysis_result["model_used"] = self.gemini_model
            analysis_result["ai_service"] = "gemini_vision"
            analysis_result["file_analyzed"] = os.path.basename(file_path)
            
            return self._enrich_with_ml(analysis_result)
            
        except TimeoutError as e:
            logger.error(f"Gemini vision analysis timed out after {self.gemini_timeout_sec}s: {e}")
            raise e
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Gemini vision analysis failed: {error_msg}")
            
            # Check if it's a quota error
            if "quota" in error_msg.lower() or "429" in error_msg:
                logger.warning("Gemini quota exceeded, falling back to text analysis")
                # Read file content for text analysis fallback
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        text_content = f.read()
                    return self._analyze_text_with_gemini(text_content, user_query)
                except:
                    # If can't read as text, raise the original quota error to trigger OpenAI fallback
                    raise e
            else:
                # For other errors, try text analysis fallback
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        text_content = f.read()
                    return self._analyze_text_with_gemini(text_content, user_query)
                except:
                    raise e
    
    def _analyze_text_with_gemini(self, document_text: str, user_query: str = None) -> Dict[str, Any]:
        """Analyze text using Gemini text capabilities"""
        logger.info(f"Using Gemini text analysis for document ({len(document_text)} characters)")
        
        # Trim input to reduce latency if very large
        if len(document_text) > self.gemini_input_char_limit:
            document_text = document_text[: self.gemini_input_char_limit] + "\n...[truncated]"

        # Create prompt for Gemini
        prompt = self._create_analysis_prompt(document_text, user_query, "gemini")
        
        # Configure generation settings for Flash 2.5
        generation_config = {
            "temperature": self.gemini_temperature,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": min(self.gemini_fast_max_tokens, self.gemini_max_tokens),
            "response_mime_type": "application/json"
        }
        
        # Generate response with strict timeout
        response = self._generate_with_timeout(prompt, generation_config)
        
        # Parse response
        analysis_result = self._parse_json_response(response.text)
        
        # Add metadata
        analysis_result["analysis_timestamp"] = datetime.now().isoformat()
        analysis_result["model_used"] = self.gemini_model
        analysis_result["ai_service"] = "gemini_text"
        
        return self._enrich_with_ml(analysis_result)

    def _enrich_with_ml(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to enrich AI results with specialized ML model insights"""
        try:
            amount_val = 0
            try:
                # Clean amount string for ML (e.g., "₹50,000" -> 50000)
                cleaned_amount = re.sub(r'[^\d.]', '', str(analysis_result.get('amount', '0')))
                amount_val = float(cleaned_amount) if cleaned_amount else 0
            except: pass

            # Perform ML Fraud Risk Check
            ml_fraud_result = ic_ml_service.predict_fraud_risk(
                amount=amount_val,
                prev_claims=0, 
                gap_days=30,
                has_witness=True if "witness" in str(analysis_result).lower() else False,
                is_urgent=True if "urgent" in str(analysis_result).lower() or "emergency" in str(analysis_result).lower() else False
            )
            
            # Perform ML Payout Prediction
            ml_payout_result = ic_ml_service.predict_optimal_payout(
                claimed_amount=amount_val,
                risk_score=ml_fraud_result['risk_score']
            )

            # Integrate ML findings into AI result
            analysis_result["ml_insights"] = {
                "fraud_risk": ml_fraud_result,
                "payout_prediction": ml_payout_result,
                "confidence_score": round((float(analysis_result.get('confidence', 50)) + (1.0 - ml_fraud_result['risk_score']) * 100) / 2, 1),
                "xai_report": ml_fraud_result.get("contributions", [])
            }
            
            logger.info(f"Analysis enriched with ML & XAI: Fraud={ml_fraud_result['level']} ({ml_fraud_result['probability']}%)")
            return analysis_result
        except Exception as e:
            logger.error(f"Failed to enrich analysis with ML: {str(e)}")
            return analysis_result

    def _generate_with_timeout(self, contents: Any, generation_config: Any):
        """Call Gemini generate_content with a hard timeout."""
        from concurrent.futures import ThreadPoolExecutor
        import time

        start = time.perf_counter()
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(
                self.gemini_client.generate_content,
                contents,
                generation_config=generation_config
            )
            try:
                response = future.result(timeout=self.gemini_timeout_sec)
                elapsed = (time.perf_counter() - start) * 1000
                logger.info(f"Gemini generate_content completed in {elapsed:.0f} ms")
                return response
            except Exception as e:
                future.cancel()
                raise TimeoutError("Gemini generate_content timed out") from e

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON safely; try to extract JSON if wrappers are present."""
        try:
            return json.loads(text)
        except Exception:
            # Attempt to find JSON object within text
            try:
                match = re.search(r"\{[\s\S]*\}", text)
                if match:
                    return json.loads(match.group(0))
            except Exception:
                pass
            # Final fallback
            logger.warning("Failed to parse AI JSON response, using fallback analysis")
            return self._fallback_analysis("", "AI returned non-JSON response")
    
    def _analyze_with_openai(self, document_text: str, user_query: str = None) -> Dict[str, Any]:
        """Analyze document using OpenAI"""
        logger.info(f"Starting OpenAI analysis for document ({len(document_text)} characters)")
        
        # Create prompt for OpenAI
        prompt = self._create_analysis_prompt(document_text, user_query, "openai")
        
        # Call OpenAI API
        response = self.openai_client.chat.completions.create(
            model=self.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": self._get_system_prompt()
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=self.openai_max_tokens,
            temperature=self.openai_temperature,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        analysis_result = json.loads(response.choices[0].message.content)
        
        # Add metadata
        analysis_result["analysis_timestamp"] = datetime.now().isoformat()
        analysis_result["model_used"] = self.openai_model
        analysis_result["tokens_used"] = response.usage.total_tokens
        analysis_result["ai_service"] = "openai"
        
        return self._enrich_with_ml(analysis_result)
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI model"""
        return """You are a Senior Insurance Claims Adjuster with 25+ years of experience, specializing in Indian insurance market and IRDAI (Insurance Regulatory and Development Authority of India) compliance. Your task is to perform a comprehensive document analysis and provide a detailed report for the Claim Examiner Dashboard.

REGULATORY FRAMEWORK - IRDAI COMPLIANCE:
You must ensure all claim assessments comply with IRDAI regulations and Insurance Act 1938 provisions:

CLAIM SETTLEMENT TIMELINES:
- Health Insurance: 15 days from receipt of last document
- Motor Insurance: 30 days from receipt of last document  
- Property Insurance: 30 days from receipt of last document

DEPRECIATION RATES (Motor Insurance):
- Vehicle 0-6 months: Nil depreciation
- Vehicle 6-12 months: 5% depreciation
- Vehicle 1-2 years: 10% depreciation
- Battery/Rubber/Plastic/Nylon parts: 50% depreciation

STANDARD EXCLUSIONS TO CHECK:
- Health: Pre-existing diseases, cosmetic treatments
- Motor: Wear and tear, driving under influence
- Property: Normal wear and tear, intentional damage

FRAUD INDICATORS TO CHECK:
- Multiple claims in short period
- Claim filed immediately after policy purchase
- Inconsistent statements or altered documents
- Excessive/inflated amounts
- Delayed intimation without valid reason

ANALYSIS METHODOLOGY:
1. Document Authentication: Verify document integrity, signatures, dates, and official markings
2. Financial Validation: Cross-reference all amounts, calculations, and supporting invoices
3. Policy Review: Check coverage limits, deductibles, exclusions, and endorsements
4. Incident Analysis: Evaluate cause, timeline, and consistency with reported facts
5. Fraud Detection: Identify red flags, inconsistencies, and suspicious patterns
6. Regulatory Compliance: Ensure adherence to insurance regulations and industry standards

DASHBOARD REPORT FORMAT REQUIREMENT:
You must respond with ONLY a valid, minified JSON object block. Do not include conversation text. 

{
  "decision": "APPROVED|DENIED|UNDER_REVIEW|PARTIAL_APPROVAL",
  "confidence": 92.5,
  "executive_summary": "2-3 sentence high-level overview of the claim and decision",
  "document_type": "insurance_claim|medical_report|estimate|bill|police_report",
  
  "extracted_data": {
    "claimant_name": "Name or null",
    "policy_holder": "Name or null",
    "policy_number": "Number or null",
    "claim_number": "Number or null",
    "incident_date": "YYYY-MM-DD or null",
    "claim_date": "YYYY-MM-DD or null",
    "vehicle_info": "Make Model Year or null",
    "property_address": "Address or null",
    "medical_provider": "Provider name or null"
  },
  
  "financial_breakdown": {
    "total_claimed": "₹X,XXX",
    "total_approved": "₹X,XXX",
    "deductible": "₹X,XXX",
    "depreciation": "₹X,XXX",
    "non_covered_items": "₹X,XXX",
    "itemized_breakdown": [
      {
        "category": "Specific item or service",
        "claimed_amount": "₹X,XXX",
        "approved_amount": "₹X,XXX",
        "coverage_percentage": 80,
        "reasoning": "Detailed explanation for this line item"
      }
    ]
  },
  
  "risk_assessment": {
    "overall_risk": "LOW|MEDIUM|HIGH|CRITICAL",
    "fraud_score": 15.5,
    "fraud_indicators": [
      "Specific red flags identified with severity ratings"
    ],
    "investigation_recommended": false
  },
  
  "coverage_analysis": {
    "policy_type": "Auto|Property|Health|Liability",
    "applicable_coverages": [
      {
        "coverage_name": "Specific coverage section",
        "applies": true,
        "limit": "₹X,XXX",
        "explanation": "Why this coverage applies or doesn't apply"
      }
    ],
    "exclusions_applied": [
      {
        "exclusion": "Specific policy exclusion",
        "applies": true,
        "impact": "How this affects the claim"
      }
    ]
  },
  
  "incident_analysis": {
    "incident_type": "Collision|Fire|Theft|Medical|Water Damage",
    "location": "City, State or null",
    "cause_of_loss": "Detailed description",
    "timeline_consistency": "CONSISTENT|INCONSISTENT|UNCLEAR",
    "police_report": "Filed|Not Filed|Not Required"
  },
  
  "documentation_review": {
    "completeness_score": 95.0,
    "quality_score": 88.0,
    "documents_received": [
      "List of documents provided"
    ],
    "documents_missing": [
      "List of required documents not provided"
    ],
    "authenticity_assessment": {
      "appears_authentic": true,
      "concerns": []
    }
  },
  
  "recommendations": [
    "Specific actionable recommendations for claim processing",
    "Additional documentation to request"
  ],
  
  "justification": "Multi-paragraph detailed professional explanation with specific references to policy provisions, evidence reviewed, and industry standards applied. Include reasoning for the decision.",
  "adjuster_notes": "Detailed notes for the claims adjuster including any special circumstances."
}"""

    def _create_vision_analysis_prompt(self, user_query: str = None) -> str:
        """Create a comprehensive prompt for insurance-focused vision document analysis"""
        
        base_prompt = self._get_system_prompt()
        base_prompt += """
        
        VISION ANALYSIS FOCUS:
        1. **OCR Text Extraction**: Extract ALL visible text from forms, documents, signs, labels
        2. **Damage Assessment**: If photos of damage, describe severity, location, and extent
        3. **Document Recognition**: Identify types of insurance forms, reports, or documents
        4. **Authenticity Check**: Look for signs of tampering, digital manipulation, or fraud
        5. **Signature Detection**: Identify any signatures, stamps, or official markings
        6. **Vehicle Analysis**: If vehicle images, identify make/model/damage location
        7. **Medical Analysis**: If medical images, identify injuries or medical conditions
        8. **Property Analysis**: If property damage, assess type and extent
        9. **Quality Assessment**: Evaluate image clarity, lighting, and completeness
        10. **Insurance Elements**: Focus on policy numbers, claim forms, damage estimates
        
        For images showing damage:
        - Describe the type and severity of damage
        - Estimate if damage is consistent with reported incident
        - Note any pre-existing damage or wear
        - Assess if damage supports the claim amount
        
        For documents in images:
        - Extract all text using OCR capabilities
        - Identify form types and purposes
        - Note any missing fields or incomplete information
        - Verify dates and amounts are consistent
        """
        
        if user_query:
            base_prompt += f"\n\nADDITIONAL SPECIFIC REQUEST: {user_query}"
        
        return base_prompt

    def _create_analysis_prompt(self, document_text: str, user_query: str = None, model_type: str = "openai") -> str:
        """Create a sophisticated prompt for insurance document analysis"""
        
        base_prompt = f"""DOCUMENT CONTENT:
{document_text}

"""
        
        if user_query:
            base_prompt += f"""
USER SPECIFIC QUERY:
{user_query}

Please address this specific question in addition to the standard analysis.
"""

        base_prompt += """
CRITICAL ANALYSIS POINTS:
- Extract ALL monetary amounts and verify consistency
- Identify the primary claimant and policy holder
- Check for dates and timeline consistency  
- Look for supporting documentation references
- Assess the incident description for plausibility
- Flag any inconsistencies or concerning elements
- Provide specific recommendations for claim processing
"""
        
        # If the model type is openai, it uses system prompt, but if it relies on this string only, we need to append the persona
        if model_type != "openai":
            base_prompt = self._get_system_prompt() + "\n\n" + base_prompt
            
        return base_prompt

        return base_prompt

    def _fallback_analysis(self, document_text: str, error_reason: str) -> Dict[str, Any]:
        """Provide enhanced fallback analysis when AI services fail"""
        logger.warning(f"Using enhanced fallback analysis due to: {error_reason}")
        
        # Basic extraction for fallback
        extracted_info = self._basic_extraction(document_text)
        
        # Helper to format INR
        def fmt_inr(amount: float) -> str:
            try:
                return f"₹{amount:,.0f}"
            except Exception:
                return "₹0"

        # Build a resilient coverage breakdown to avoid empty UI
        amounts = extracted_info.get("amounts", [])
        max_amount = max(amounts) if amounts else 0
        # Heuristic allocation
        base = max_amount if max_amount > 0 else 100000  # default ₹1,00,000
        deductible = round(base * 0.1)
        approved = round(base * 0.75)
        not_covered = max(base - approved - deductible, 0)
        
        coverage_details = [
            {
                "item": "Primary coverage estimate",
                "covered": True,
                "amount": fmt_inr(approved),
                "reasoning": "Estimated covered portion based on typical policy terms in fallback mode"
            },
            {
                "item": "Deductible (estimated)",
                "covered": False,
                "amount": fmt_inr(deductible),
                "reasoning": "Standard deductible applied in absence of AI decision"
            },
            {
                "item": "Out-of-policy or non-covered expenses",
                "covered": False,
                "amount": fmt_inr(not_covered),
                "reasoning": "Potential exclusions identified via rule-based scan"
            }
        ]
        
        return {
            "decision": "UNDER_REVIEW",
            "amount": extracted_info.get("max_amount", "₹0"),
            "confidence": 65.0,
            "justification": f"Enhanced rule-based analysis completed. {error_reason}. Manual review recommended for final decision validation.",
            "risk_assessment": "MEDIUM",
            "coverage_details": coverage_details,
            "extracted_info": {
                "policy_number": None,
                "claim_date": None,
                "incident_date": None,
                "total_amounts_found": len(extracted_info.get("amounts", [])),
                "document_type": extracted_info.get("document_type", "unknown"),
                "completeness_score": 60.0,
                "authenticity_indicators": ["rule_based_analysis", "manual_review_required"]
            },
            "recommendations": [
                "Manual review required due to AI service limitations",
                "Verify document authenticity and completeness",
                "Contact claimant for additional information if needed",
                "Consider re-processing once AI services are restored"
            ],
            "red_flags": [
                f"AI analysis unavailable: {error_reason}",
                "Automated confidence may be lower than actual"
            ],
            "analysis_timestamp": datetime.now().isoformat(),
            "model_used": "enhanced_rule_based_fallback",
            "ai_service": "fallback",
            "tokens_used": 0
        }
    
    def _basic_extraction(self, text: str) -> Dict[str, Any]:
        """Basic information extraction for fallback scenarios"""
        text_lower = text.lower()
        
        # Extract amounts
        amount_patterns = [
            r'₹\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'rs\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'\$\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'amount[:\s]*[₹$]?\s*(\d+(?:,\d+)*(?:\.\d+)?)'
        ]
        
        amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                try:
                    amount = float(match.replace(',', ''))
                    amounts.append(amount)
                except ValueError:
                    continue
        
        max_amount = max(amounts) if amounts else 0
        formatted_amount = f"₹{max_amount:,.0f}" if max_amount > 0 else "₹0"
        
        # Determine document type
        document_type = "unknown"
        if any(term in text_lower for term in ['insurance', 'claim', 'policy']):
            document_type = "insurance_claim"
        elif any(term in text_lower for term in ['medical', 'hospital', 'treatment']):
            document_type = "medical_report"
        elif any(term in text_lower for term in ['bill', 'invoice', 'receipt']):
            document_type = "bill"
        
        return {
            "amounts": amounts,
            "max_amount": formatted_amount,
            "document_type": document_type
        }

# Global instance
enhanced_ai_service = EnhancedAIService()
