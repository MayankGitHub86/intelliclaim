import logging
from datetime import datetime
from typing import Dict, Any, Optional
import random

logger = logging.getLogger(__name__)

class WeatherForensicsService:
    """
    Service to validate insurance claims against historical weather data.
    """
    
    def __init__(self):
        # In a real app, this would be an API key for OpenWeatherMap or VisualCrossing
        self.api_key = "mock_key"

    async def verify_weather_conditions(self, location: str, date_time: str, claimed_condition: str) -> Dict[str, Any]:
        """
        Verify if the claimed weather condition matches historical data for the location.
        
        Args:
            location: The city or coordinates of the incident.
            date_time: ISO format datetime string of the incident.
            claimed_condition: The weather condition reported by user (e.g., 'rain', 'snow', 'storm').
        """
        logger.info(f"Verifying weather for {location} at {date_time}. Claimed: {claimed_condition}")
        
        # Mocking the external Weather API call for reliability in this demo
        # In production, we'd hit: https://api.weatherapi.com/v1/history.json
        
        # Simulate logic: 
        # - "Mumbai" often has rain in July/August
        # - "Delhi" has fog in December
        
        dt = datetime.fromisoformat(date_time.replace('Z', '+00:00'))
        is_consistent = True
        actual_condition = "Clear"
        temp_c = 25.0
        humidity = 60
        
        # Mock logic for demonstration effectiveness
        lower_condition = claimed_condition.lower()
        
        if "rain" in lower_condition or "storm" in lower_condition or "flood" in lower_condition:
            # Simulate a match for demo purposes if it looks like a valid test case
            # Or randomized strictly for 'verification' demo
            confidence = 94.5
            actual_condition = "Heavy Rain"
            precipitation_mm = 45.2
            is_consistent = True
            risk_score = 10
        elif "snow" in lower_condition:
            # Unlikely in many places, verify strict
            confidence = 88.0
            actual_condition = "Light Snow"
            precipitation_mm = 5.0
            is_consistent = True
            risk_score = 15
        else:
            # Default 'clear' vs 'rain' conflict simulation
            # If they claimed rain but we say clear
            if random.random() > 0.7: # 30% chance of fraud detection in demo
                actual_condition = "Clear Sky"
                precipitation_mm = 0.0
                is_consistent = False
                risk_score = 85
                confidence = 99.1
            else:
                actual_condition = claimed_condition.title() # Trust them
                precipitation_mm = 12.0
                is_consistent = True
                risk_score = 5
        
        return {
            "is_consistent": is_consistent,
            "risk_score": risk_score,
            "confidence": confidence,
            "details": {
                "claimed_condition": claimed_condition,
                "historical_actual": actual_condition,
                "temperature": f"{temp_c}°C",
                "precipitation": f"{precipitation_mm}mm",
                "wind_speed": "15km/h",
                "visibility": "10km" if is_consistent else "Unlimited",
                "source": "Global Historical Weather Network (Simulated)"
            },
            "summary": f"Weather consistency {'CONFIRMED' if is_consistent else 'FAILED'}. Claimed '{claimed_condition}' matches historical data." if is_consistent else f"Weather DISCREPANCY detected. Claimed '{claimed_condition}' but historical data shows '{actual_condition}'."
        }

weather_service = WeatherForensicsService()
