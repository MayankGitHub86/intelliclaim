import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Brain, 
  Shield, 
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Upload
} from 'lucide-react';
import { DEMO_SCENARIOS, DEMO_RESULTS, PROCESSING_STEPS, DEMO_CONFIG } from '../config/demo-data';

interface DemoDashboardProps {
  onScenarioSelect?: (scenarioId: string) => void;
}

export function DemoDashboard({ onScenarioSelect }: DemoDashboardProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  // Simulate processing with realistic steps
  const processScenario = async (scenarioId: string) => {
    setIsProcessing(true);
    setShowResult(false);
    setProgress(0);
    setCurrentStep(0);

    // Simulate processing steps
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setCurrentStep(i);
      setProgress(PROCESSING_STEPS[i].progress);
      
      await new Promise(resolve => 
        setTimeout(resolve, PROCESSING_STEPS[i].duration)
      );
    }

    // Get cached result based on scenario
    let demoResult;
    switch (scenarioId) {
      case 'car_minor':
        demoResult = DEMO_RESULTS.carAccidentMinor;
        break;
      case 'water_damage':
        demoResult = DEMO_RESULTS.waterDamage;
        break;
      case 'medical':
        demoResult = DEMO_RESULTS.medicalClaim;
        break;
      default:
        demoResult = DEMO_RESULTS.carAccidentMinor;
    }

    setResult(demoResult);
    setIsProcessing(false);
    setShowResult(true);
  };

  const handleScenarioClick = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    onScenarioSelect?.(scenarioId);
    await processScenario(scenarioId);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'APPROVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'REQUIRES_INSPECTION':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'DENY':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'APPROVE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REQUIRES_INSPECTION':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'DENY':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            🏆 IntelliClaim Demo Dashboard
          </motion.h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-Powered Insurance Claim Processing • Live Demo for Judges
          </p>
        </div>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {DEMO_SCENARIOS.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedScenario === scenario.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handleScenarioClick(scenario.id)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {scenario.title}
                    <Badge variant={scenario.severity === 'low' ? 'default' : scenario.severity === 'medium' ? 'destructive' : 'secondary'}>
                      {scenario.expectedResult}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Claim Amount</span>
                    <span className="font-semibold text-lg">{scenario.amount}</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Process This Claim
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Processing Animation */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Brain className="h-8 w-8 text-blue-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mt-4 text-blue-800">
                      AI Processing Your Claim...
                    </h3>
                    <p className="text-blue-600 mt-2">
                      {PROCESSING_STEPS[currentStep]?.step || "Processing..."}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Progress: {progress}%</span>
                      <span>ETA: {Math.max(0, 6 - currentStep)}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Main Result Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                      Claim Analysis Complete
                    </span>
                    <Badge className={`${getRecommendationColor(result.recommendation)} border`}>
                      {getRecommendationIcon(result.recommendation)}
                      <span className="ml-2">{result.recommendation}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{(result.confidence * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{result.claimAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Claim Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{result.processingTime}</div>
                      <div className="text-sm text-gray-500">Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {result.analysis.fraudDetection?.riskLevel || 'Low'}
                      </div>
                      <div className="text-sm text-gray-500">Fraud Risk</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analysis Summary
                    </h4>
                    <p className="text-gray-700">{result.explanation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Damage Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-600" />
                    Computer Vision Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.analysis.damageDetection && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Damage Detected:</span>
                        <Badge variant={result.analysis.damageDetection.detected ? "default" : "secondary"}>
                          {result.analysis.damageDetection.detected ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Severity:</span>
                        <span className="font-medium capitalize">{result.analysis.damageDetection.severity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="font-medium capitalize">{result.analysis.damageDetection.location?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Estimated Cost:</span>
                        <span className="font-medium text-green-600">₹{result.analysis.damageDetection.estimatedCost?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Policy Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Policy Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Policy Status:</span>
                      <Badge variant={result.analysis.policyCheck?.valid ? "default" : "destructive"}>
                        {result.analysis.policyCheck?.valid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Coverage Type:</span>
                      <span className="font-medium capitalize">{result.analysis.policyCheck?.coverage?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Deductible:</span>
                      <span className="font-medium">₹{result.analysis.policyCheck?.deductible?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Max Coverage:</span>
                      <span className="font-medium">₹{result.analysis.policyCheck?.maxCoverage?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Extracted Information (OCR + LLM)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Information:</h4>
                      <ul className="space-y-1 text-sm">
                        {result.analysis.extractedText?.map((text: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Next Steps:</h4>
                      <ul className="space-y-1 text-sm">
                        {result.nextSteps?.map((step: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Controls */}
        <div className="mt-8 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-blue-50">
                  <Clock className="h-3 w-3 mr-1" />
                  Demo Mode Active
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  <Zap className="h-3 w-3 mr-1" />
                  Instant Results
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  <Brain className="h-3 w-3 mr-1" />
                  Pre-trained AI Models
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
