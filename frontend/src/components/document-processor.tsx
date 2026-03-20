import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiClient, API_CONFIG } from '../config/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { formatIndianRupees, convertUSDToINR, parseIndianRupees } from '../utils/currency';
import {
  Search,
  Mic,
  MicOff,
  Upload,
  FileText,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Sparkles,
  Download,
  Eye,
  TrendingUp,
  DollarSign,
  X
} from 'lucide-react';

export function DocumentProcessor() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [documentId, setDocumentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Handle view details modal
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to normalize amounts to Indian format
  const normalizeToIndianRupees = (amount: string | number): number => {
    if (!amount || amount === 'Amount not specified') return 0;
    
    // If it's a string, check if it contains USD/dollar symbols and convert
    if (typeof amount === 'string') {
      // Handle common text patterns
      if (amount.toLowerCase().includes('not specified') || 
          amount.toLowerCase().includes('n/a') || 
          amount.toLowerCase().includes('unavailable')) {
        return 0;
      }
      
      const cleanAmount = amount.replace(/[^\d.-]/g, '');
      const numAmount = parseFloat(cleanAmount);
      
      if (isNaN(numAmount)) return 0;
      
      // If the original string contained USD/$, convert to INR
      if (amount.includes('$') || amount.toLowerCase().includes('usd')) {
        return convertUSDToINR(numAmount);
      }
      
      return numAmount;
    }
    
    return typeof amount === 'number' ? amount : 0;
  };

  // Voice recognition functionality
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast.info('🎤 Listening... Speak your query');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        toast.success('✅ Voice input captured');
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('❌ Voice recognition failed');
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      setRecognition(recognition);
    } else {
      toast.error('❌ Voice recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      toast.info('🔇 Voice input stopped');
    }
  };

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  // Handle PDF export with professional formatting
  const handleExportPDF = () => {
    if (!result) {
      toast.error('No analysis result to export');
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      
      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        checkNewPage(25);
        pdf.setFillColor(0, 102, 255); // Blue background
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 5, yPosition + 7);
        pdf.setTextColor(0, 0, 0); // Reset to black
        yPosition += 15;
      };
      
      // Helper function to add key-value pair
      const addKeyValue = (key: string, value: string, bold: boolean = false) => {
        checkNewPage();
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${key}:`, margin, yPosition);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        const keyWidth = pdf.getTextWidth(`${key}: `);
        pdf.text(value, margin + keyWidth, yPosition);
        yPosition += 6;
      };
      
      // ===== HEADER =====
      pdf.setFillColor(0, 102, 255);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INTELLICLAIM', margin, 15);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Insurance Claim Analysis Report', margin, 25);
      
      pdf.setTextColor(0, 0, 0);
      yPosition = 45;
      
      // ===== DOCUMENT INFORMATION =====
      addSectionHeader('DOCUMENT INFORMATION');
      
      addKeyValue('Document Name', selectedFile?.name || 'Unnamed Document');
      addKeyValue('Analysis Date', new Date().toLocaleString('en-US', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      }));
      addKeyValue('Report ID', result.analysisId || `RPT-${Date.now()}`);
      addKeyValue('Analysis Model', result.model_used || 'IntelliClaim AI');
      yPosition += 5;
      
      // ===== EXECUTIVE SUMMARY =====
      if (result.executive_summary) {
        addSectionHeader('EXECUTIVE SUMMARY');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(result.executive_summary, pageWidth - 2 * margin);
        pdf.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 10;
      }
      
      // ===== CLAIM DECISION =====
      addSectionHeader('CLAIM DECISION');
      
      // Decision with color coding
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const decisionColors = {
        'APPROVED': [0, 200, 0],
        'PARTIAL_APPROVAL': [255, 165, 0],
        'UNDER_REVIEW': [255, 193, 7],
        'DENIED': [220, 53, 69]
      };
      const color = decisionColors[result.decision] || [0, 0, 0];
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(`DECISION: ${result.decision}`, margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 12;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      addKeyValue('Claim Amount', formatIndianRupees(result.amount), true);
      addKeyValue('Confidence Score', `${confidence}%`, true);
      addKeyValue('Risk Assessment', result.risk_assessment || 'MEDIUM');
      yPosition += 5;
      
      // ===== FINANCIAL BREAKDOWN =====
      if (result.financial_breakdown || result.financial_summary) {
        addSectionHeader('FINANCIAL BREAKDOWN');
        
        const financial = result.financial_breakdown || result.financial_summary || {};
        
        if (financial.total_claimed) addKeyValue('Total Claimed', financial.total_claimed);
        if (financial.total_approved) addKeyValue('Total Approved', financial.total_approved);
        if (financial.deductible || financial.deductible_applied) {
          addKeyValue('Deductible Applied', financial.deductible || financial.deductible_applied);
        }
        if (financial.depreciation || financial.depreciation_applied) {
          addKeyValue('Depreciation', financial.depreciation || financial.depreciation_applied);
        }
        if (financial.net_payout) addKeyValue('Net Payout', financial.net_payout, true);
        yPosition += 5;
      }
      
      // ===== COVERAGE DETAILS =====
      if (result.coverageDetails && result.coverageDetails.length > 0) {
        addSectionHeader('COVERAGE BREAKDOWN');
        
        pdf.setFontSize(9);
        result.coverageDetails.forEach((item, index) => {
          checkNewPage(15);
          
          const status = item.covered ? '✓' : '✗';
          const statusColor = item.covered ? [0, 150, 0] : [200, 0, 0];
          
          pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          pdf.setFont('helvetica', 'bold');
          pdf.text(status, margin, yPosition);
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${item.item}`, margin + 5, yPosition);
          
          pdf.setFont('helvetica', 'bold');
          const amountText = formatIndianRupees(item.amount);
          pdf.text(amountText, pageWidth - margin - pdf.getTextWidth(amountText), yPosition);
          
          yPosition += 5;
          
          if (item.reasoning) {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(100, 100, 100);
            const reasonLines = pdf.splitTextToSize(item.reasoning, pageWidth - 2 * margin - 10);
            pdf.text(reasonLines, margin + 10, yPosition);
            yPosition += reasonLines.length * 4 + 3;
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
          }
        });
        yPosition += 5;
      }
      
      // ===== DETAILED JUSTIFICATION =====
      addSectionHeader('DETAILED ANALYSIS & JUSTIFICATION');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const justificationLines = pdf.splitTextToSize(
        result.justification || 'No detailed justification provided.',
        pageWidth - 2 * margin
      );
      
      justificationLines.forEach((line: string) => {
        checkNewPage();
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
      
      // ===== INCIDENT ANALYSIS =====
      if (result.incident_analysis) {
        addSectionHeader('INCIDENT ANALYSIS');
        
        const incident = result.incident_analysis;
        if (incident.incident_type) addKeyValue('Incident Type', incident.incident_type);
        if (incident.incident_date) addKeyValue('Incident Date', incident.incident_date);
        if (incident.reported_date) addKeyValue('Reported Date', incident.reported_date);
        if (incident.location) addKeyValue('Location', incident.location);
        if (incident.cause_of_loss) {
          checkNewPage(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Cause of Loss:', margin, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
          const causeLines = pdf.splitTextToSize(incident.cause_of_loss, pageWidth - 2 * margin);
          pdf.text(causeLines, margin, yPosition);
          yPosition += causeLines.length * 5 + 5;
        }
      }
      
      // ===== RISK ASSESSMENT =====
      if (result.risk_assessment && typeof result.risk_assessment === 'object') {
        addSectionHeader('RISK ASSESSMENT');
        
        const risk = result.risk_assessment;
        if (risk.overall_risk) addKeyValue('Overall Risk Level', risk.overall_risk);
        if (risk.fraud_score !== undefined) addKeyValue('Fraud Score', `${risk.fraud_score}/100`);
        
        if (risk.fraud_indicators && risk.fraud_indicators.length > 0) {
          checkNewPage(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Fraud Indicators:', margin, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
          risk.fraud_indicators.forEach((indicator: string) => {
            checkNewPage();
            pdf.text(`• ${indicator}`, margin + 5, yPosition);
            yPosition += 5;
          });
        }
        yPosition += 5;
      }
      
      // ===== RECOMMENDATIONS =====
      if (result.recommendations && result.recommendations.length > 0) {
        addSectionHeader('RECOMMENDATIONS');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        result.recommendations.forEach((rec: any, index: number) => {
          checkNewPage(10);
          const recText = typeof rec === 'string' ? rec : rec.action || rec;
          pdf.text(`${index + 1}. ${recText}`, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }
      
      // ===== RED FLAGS =====
      if (result.red_flags && result.red_flags.length > 0) {
        addSectionHeader('RED FLAGS & CONCERNS');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(200, 0, 0);
        result.red_flags.forEach((flag: any) => {
          checkNewPage(10);
          const flagText = typeof flag === 'string' ? flag : flag.flag || flag;
          pdf.text(`⚠ ${flagText}`, margin, yPosition);
          yPosition += 6;
        });
        pdf.setTextColor(0, 0, 0);
        yPosition += 5;
      }
      
      // ===== ADJUSTER NOTES =====
      if (result.adjuster_notes) {
        addSectionHeader('ADJUSTER NOTES');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        const notesLines = pdf.splitTextToSize(result.adjuster_notes, pageWidth - 2 * margin);
        notesLines.forEach((line: string) => {
          checkNewPage();
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }
      
      // ===== FOOTER ON EVERY PAGE =====
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Footer text
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `IntelliClaim AI Analysis Report | Generated: ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 10
        );
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
        pdf.setTextColor(0, 0, 0);
      }

      // Save the PDF with descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      const decision = result.decision || 'ANALYSIS';
      const fileName = `IntelliClaim_${decision}_${timestamp}_${result.analysisId || Date.now()}.pdf`;
      pdf.save(fileName);
      
      toast.success('Professional PDF report exported successfully!');
    } catch (error) {
      console.error('PDF Export failed:', error);
      toast.error('Failed to export PDF report. Please try again.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Check if we have an auth token, if not use test token
      let currentToken = localStorage.getItem('auth_token');
      if (!currentToken) {
        currentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGJkODNmYmQtZGM0NS00Y2M3LWIwYmItYjE4NGU2MjZiM2YzIiwiZXhwIjoxNzU4NzI4MTM1fQ.Tis1-cbFc80ZqG0IHdIn51rGXCkhYrdjTH5gwgsMOAs";
        console.log('Using fallback test token for upload');
      } else {
        console.log('Using stored auth token for upload');
      }
      
      apiClient.setToken(currentToken);
      
      const response = await apiClient.uploadFile(
        API_CONFIG.ENDPOINTS.DOCUMENTS.UPLOAD,
        file
      );
      
      setDocumentId(response.document_id);
      setSelectedFile(file);
      toast.success(`File uploaded: ${response.filename}`);
    } catch (error: any) {
      console.error('Upload failed:', error);
      console.warn('Backend unavailable, using offline mode for file upload');
      
      // Generate a fake document ID for offline mode
      const fakeDocumentId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setDocumentId(fakeDocumentId);
      setSelectedFile(file);
      
      toast.success(`📁 File ready for analysis (Offline Mode): ${file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }
    
    if (!documentId) {
      toast.error('Please upload a document first before analysis');
      return;
    }
    
    // Ensure we have authentication
    let currentToken = localStorage.getItem('auth_token');
    if (!currentToken) {
      currentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGJkODNmYmQtZGM0NS00Y2M3LWIwYmItYjE4NGU2MjZiM2YzIiwiZXhwIjoxNzU4NzI4MTM1fQ.Tis1-cbFc80ZqG0IHdIn51rGXCkhYrdjTH5gwgsMOAs";
      console.log('Using fallback test token for analysis');
    } else {
      console.log('Using stored auth token for analysis');
    }
    apiClient.setToken(currentToken);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setResult(null);
    
    try {
      // Simulate progress steps
      const steps = [
        { progress: 25, text: 'Analyzing document structure...' },
        { progress: 50, text: 'Extracting key information...' },
        { progress: 75, text: 'Running policy checks...' },
        { progress: 100, text: 'Generating decision...' }
      ];
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProcessingProgress(step.progress);
      }
      
      // Real AI analysis with your exact query format
      console.log('Starting analysis with document ID:', documentId);
      const analysis = await apiClient.post(API_CONFIG.ENDPOINTS.DOCUMENTS.ANALYZE, {
        query: query,
        document_id: documentId
      });
      
      console.log('API Analysis Response:', analysis); // Debug log
      
      setConfidence(analysis.confidence || 85);
      
      // Extract amount from nested structure and normalize to Indian Rupees
      const rawAmount = analysis.extracted_data?.key_information?.amount || 
                       analysis.amount || 
                       analysis.claim_amount ||
                       'Amount not specified';
      
      let extractedAmount: number | string;
      if (rawAmount === 'Amount not specified') {
        // Provide a reasonable default for Indian insurance claims
        extractedAmount = 100000; // ₹1 Lakh default
      } else {
        extractedAmount = normalizeToIndianRupees(rawAmount);
      }
      
      // Extract justification/summary from analysis
      const justificationText = analysis.analysis?.summary || 
                               analysis.ai_reasoning || 
                               analysis.justification || 
                               'Analysis not available';
      
      // Create coverage details from key findings
      const coverageDetails: any[] = [];
      if (analysis.analysis?.key_findings) {
        analysis.analysis.key_findings.forEach((finding: any, index: number) => {
          coverageDetails.push({
            item: `Finding ${index + 1}`,
            covered: true,
            amount: normalizeToIndianRupees(extractedAmount),
            description: finding
          });
        });
      }
      
      // Add recommendations as coverage items
      if (analysis.analysis?.recommendations) {
        analysis.analysis.recommendations.forEach((rec: any, index: number) => {
          coverageDetails.push({
            item: `Recommendation ${index + 1}`,
            covered: true,
            amount: normalizeToIndianRupees(extractedAmount),
            description: rec
          });
        });
      }

      // Fallback coverage details when AI services are unavailable
      if (coverageDetails.length === 0) {
        const baseAmount = typeof extractedAmount === 'number' ? extractedAmount : 
                          normalizeToIndianRupees(extractedAmount) || 100000;
        
        coverageDetails.push(
          {
            item: 'Policy Coverage',
            covered: true,
            amount: baseAmount,
            reason: 'Standard policy coverage applies'
          },
          {
            item: 'Deductible',
            covered: true,
            amount: Math.round(baseAmount * 0.1), // 10% deductible
            reason: 'Policy deductible will be applied'
          },
          {
            item: 'Manual Review',
            covered: true,
            amount: 0,
            reason: 'Requires manual validation due to AI service unavailability'
          }
        );
      }
      
      // Determine decision based on AI availability and analysis quality
      let finalDecision = analysis.decision?.toUpperCase() || 'PENDING REVIEW';
      let finalJustification = justificationText;
      
      // If AI services are unavailable or analysis is limited
      if (justificationText.includes('AI services unavailable') || 
          justificationText.includes('Enhanced rule-based analysis') ||
          !analysis.ai_service) {
        finalDecision = 'PENDING REVIEW';
        finalJustification = `${justificationText} Manual review required due to AI service limitations. Standard policy coverage applies with deductible.`;
      }

      setResult({
        decision: finalDecision,
        amount: normalizeToIndianRupees(extractedAmount),
        justification: finalJustification,
        // Handle enhanced response structure
        coverageDetails: coverageDetails,
        analysisId: analysis.analysis_id || analysis.analysisId || Date.now().toString(),
        processingTime: analysis.processing_time || analysis.processingTime || 'N/A',
        // New enhanced fields
        riskAssessment: analysis.risk_assessment,
        recommendations: analysis.analysis?.recommendations || analysis.recommendations || [],
        redFlags: analysis.red_flags || [],
        extractedInfo: analysis.extracted_data || analysis.extracted_info,
        modelUsed: analysis.model_used,
        aiService: analysis.ai_service,
        // Additional Gemini-specific fields
        analysisTimestamp: analysis.analysis_timestamp,
        fileAnalyzed: analysis.file_analyzed,
        documentInfo: analysis.document_info
      });
      
      const analysisType = analysis.ai_service === 'gemini' ? 'Gemini AI' : 
                          analysis.ai_service === 'openai' ? 'OpenAI' : 
                          analysis.ai_service === 'fallback' ? 'Enhanced Rule-based' : 'AI';
      
      toast.success(`✅ ${analysisType} Analysis completed! Confidence: ${analysis.confidence}%`);
      
      // Auto-scroll to results section after analysis completion
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Analysis failed:', error);
      console.warn('Backend unavailable, using offline demo mode');
      
      // Import demo data for offline mode
      const { DEMO_RESULTS } = await import('../config/demo-data');
      
      // Select appropriate demo result based on query content
      let demoResult;
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('car') || queryLower.includes('accident') || queryLower.includes('vehicle')) {
        demoResult = DEMO_RESULTS.carAccidentMinor;
      } else if (queryLower.includes('medical') || queryLower.includes('health') || queryLower.includes('hospital')) {
        demoResult = DEMO_RESULTS.medicalClaim;
      } else {
        // Default to car accident for any other query
        demoResult = DEMO_RESULTS.carAccidentMinor;
      }
      
      // Convert demo result to expected format
      const extractedAmount = demoResult.claimAmount || 200000;
      
      const analysis = {
        decision: demoResult.recommendation,
        confidence: demoResult.confidence * 100,
        amount: extractedAmount,
        ai_reasoning: demoResult.explanation,
        coverage_details: [
          {
            item: 'Policy Coverage',
            covered: true,
            amount: extractedAmount,
            reason: 'Demo mode - Standard policy coverage'
          },
          {
            item: 'Deductible',
            covered: true, 
            amount: Math.round(extractedAmount * 0.1),
            reason: 'Demo mode - Standard deductible'
          }
        ]
      };
      
      setConfidence(demoResult.confidence * 100);
      
      const resultData = {
        decision: analysis.decision,
        amount: formatIndianRupees(extractedAmount),
        justification: `${demoResult.explanation} (Demo Mode - Backend Offline)`,
        coverageDetails: analysis.coverage_details,
        riskLevel: 'LOW',
        processingTime: demoResult.processingTime || '2.5s'
      };
      
      setResult(resultData);
      
      toast.success('🎯 Analysis Complete! (Demo Mode - Backend Offline)');
      
      // Auto scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestedQueries = [
    '46-year-old male, knee surgery, policy active for 3 years',
    'Cancer treatment, Delhi hospital, 2-year policy',
    'Car accident claim, multiple injuries, emergency treatment',
    'Diabetes medication claim, regular prescription'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/30 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Smart <span className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">Prediction</span>
          </h1>
          <p className="text-muted-foreground">AI-powered intelligent analysis and predictions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            AI Ready
          </Badge>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Query Interface */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>AI Query Interface</span>
              </CardTitle>
              <CardDescription>Describe your claim in natural language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Section */}
              <div className="p-4 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                <div className="text-center space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload Document (Optional)</p>
                    <p className="text-sm text-muted-foreground">Drag & drop or click to select files</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {isUploading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      ✓ {selectedFile.name} uploaded successfully
                    </p>
                  )}
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 p-4 border border-border/50 rounded-xl bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <Textarea
                    placeholder="Ask me anything about your claim... e.g., '46-year-old male, knee surgery, policy active for 3 years'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 w-full border-none bg-transparent resize-none min-h-[60px] sm:min-h-[40px] focus-visible:ring-0 text-sm sm:text-base"
                    rows={2}
                  />
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button 
                      onClick={isListening ? stopListening : startListening}
                      className={`p-2 hover:bg-muted rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-muted'}`}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handleProcess}
                      disabled={!query.trim() || isProcessing}
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:from-[#7C3AED] hover:to-[#0891B2] px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-pulse" />
                          <span className="hidden sm:inline">Processing</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggested Queries */}
              <div className="space-y-3">
                <p className="text-sm font-medium flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Try these examples:</span>
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQueries.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setQuery(suggestion)}
                      className="text-left p-3 text-xs sm:text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-border/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      "{suggestion}"
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Processing Animation */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 border border-[#8B5CF6]/20 rounded-xl"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Brain className="w-6 h-6 text-[#8B5CF6]" />
                    </motion.div>
                    <span className="font-medium">AI Analysis in Progress</span>
                  </div>
                  <Progress value={processingProgress} className="mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {processingProgress < 20 ? 'Analyzing document structure...' :
                     processingProgress < 40 ? 'Extracting key information...' :
                     processingProgress < 60 ? 'Running policy checks...' :
                     processingProgress < 80 ? 'Calculating coverage...' :
                     processingProgress < 100 ? 'Generating decision...' :
                     'Analysis complete!'}
                  </p>
                </motion.div>
              )}

              {/* Results */}
              {result && !isProcessing && (
                <motion.div
                  id="analysis-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Decision Card */}
                  <Card className={`border-2 ${
                    result.decision === 'APPROVED' 
                      ? 'border-[#00FF88]/50 bg-gradient-to-r from-[#00FF88]/5 to-[#00D4AA]/5' 
                      : result.decision === 'PENDING REVIEW'
                      ? 'border-[#FF6B35]/50 bg-gradient-to-r from-[#FF6B35]/5 to-[#FF1744]/5'
                      : 'border-[#FF1744]/50 bg-gradient-to-r from-[#FF1744]/5 to-[#DC2626]/5'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {result.decision === 'APPROVED' ? (
                            <CheckCircle className="w-8 h-8 text-[#00FF88]" />
                          ) : result.decision === 'PENDING REVIEW' ? (
                            <Clock className="w-8 h-8 text-[#FF6B35]" />
                          ) : (
                            <AlertCircle className="w-8 h-8 text-[#FF1744]" />
                          )}
                          <div>
                            <h3 className="text-2xl font-bold">{result.decision}</h3>
                            <p className="text-lg font-semibold text-muted-foreground">Amount: {formatIndianRupees(result.amount)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">AI Confidence</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={confidence} className="w-20 h-2" />
                            <span className="font-bold">{confidence.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Justification:</h4>
                          <p className="text-muted-foreground">{result.justification}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Coverage Breakdown:</h4>
                          <div className="space-y-2">
                            {result.coverageDetails.map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {item.covered ? (
                                    <CheckCircle className="w-4 h-4 text-[#00FF88]" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-[#FF1744]" />
                                  )}
                                  <span>{item.item}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">{formatIndianRupees(item.amount)}</span>
                                  {!item.covered && item.reason && (
                                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button 
                            onClick={handleExportPDF}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                          </button>
                          <button 
                            onClick={handleViewDetails}
                            className="flex-1 py-2 px-4 border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>


      </div>

      {/* Detailed View Modal */}
      {showDetails && result && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background border border-border rounded-xl max-w-6xl w-full h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Modal Header - Compact */}
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Analysis Report</h2>
                  <p className="text-sm text-muted-foreground">{selectedFile?.name || 'Unnamed Document'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Three Column Layout */}
            <div className="flex-1 overflow-hidden p-4">
              <div className="grid grid-cols-3 gap-4 h-full">
                
                {/* Left Column - Quick Overview */}
                <div className="space-y-4">
                  {/* Decision Card */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Badge variant={result.decision === 'APPROVED' ? 'default' : 'destructive'} className="mb-2">
                          {result.decision}
                        </Badge>
                        <p className="text-2xl font-bold text-green-600">{result.amount}</p>
                        <p className="text-sm text-muted-foreground">Claim Amount</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Confidence */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">AI Confidence</span>
                          <span className="text-lg font-bold">{confidence}%</span>
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Document Info</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{result.processingTime || 'N/A'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Middle Column - AI Analysis */}
                <div>
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 h-full">
                      <div className="bg-muted/30 rounded-lg p-3 h-[calc(100%-2rem)] overflow-y-auto">
                        <p className="text-sm leading-relaxed">{result.justification}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Coverage Details */}
                <div>
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Coverage Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {result.coverageDetails && result.coverageDetails.length > 0 ? (
                        <div className="space-y-2 h-[calc(100%-2rem)] overflow-y-auto">
                          {result.coverageDetails.map((item, index) => (
                            <div key={index} className="p-2 bg-muted/20 rounded border border-border/50">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${item.covered ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <span className="text-xs font-medium">{item.item}</span>
                                </div>
                              </div>
                              {item.description && (
                                <div className="mb-2">
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              )}
                              <div className="text-right">
                                <p className="text-sm font-bold">{item.amount || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.covered ? 'Covered' : 'Not Covered'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                          <div className="text-center">
                            <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No coverage details</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Modal Footer - Compact */}
            <div className="border-t border-border p-4 flex-shrink-0">
              <div className="flex space-x-3">
                <button 
                  onClick={handleExportPDF}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center text-sm font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}