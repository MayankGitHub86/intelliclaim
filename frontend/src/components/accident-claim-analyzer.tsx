import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { formatIndianRupees } from '../utils/currency';
import jsPDF from 'jspdf';
import {
  Upload, Camera, X, ChevronRight, ChevronLeft, FileImage, Brain, Sparkles,
  AlertTriangle, CheckCircle, Clock, Shield, MapPin, Calendar, FileText,
  Download, RotateCcw, Loader2, ImagePlus, Trash2, Info, Zap, ClipboardCheck,
  Target, TrendingUp, CircleAlert, ListChecks, Award
} from 'lucide-react';

// ── Types ──
interface UploadedPhoto {
  id: string; file: File; preview: string; progress: number; status: 'uploading' | 'done' | 'error';
}
interface DamageItem {
  item: string; severity: string; estimatedCostINR: number; repairType: string; notes: string;
}
interface AnalysisResult {
  damageSummary: string; damageItems: DamageItem[]; totalEstimatedClaimINR: number;
  claimFilingChecklist: string[]; recommendedActions: string[]; confidenceLevel: number;
  urgencyLevel: string; additionalNotes: string;
}
interface ClaimForm {
  incidentType: string; dateOfIncident: string; description: string; location: string; policyType: string;
}

const INCIDENT_TYPES = ['Vehicle Accident','Property Damage','Natural Disaster','Fire Damage','Theft or Vandalism','Other'];
const POLICY_TYPES = ['Comprehensive','Third-Party','Home & Contents','Commercial','Health','Other'];
const STORAGE_KEY = 'intelliclaim_accident_draft';
const ACCEPTED_TYPES = ['image/jpeg','image/png','image/webp','image/heic','image/heif'];
const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

const today = () => new Date().toISOString().split('T')[0];

const severityColor = (s: string) => {
  const m: Record<string, string> = {
    'Low': 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    'Medium': 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
    'High': 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
    'Total Loss': 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
  };
  return m[s] || m['Medium'];
};

const urgencyColor = (u: string) => {
  const m: Record<string, string> = {
    'Immediate': 'bg-red-500 text-white', 'Within 24hrs': 'bg-orange-500 text-white',
    'Within 7 days': 'bg-amber-500 text-white', 'Non-urgent': 'bg-green-500 text-white',
  };
  return m[u] || 'bg-gray-500 text-white';
};

export function AccidentClaimAnalyzer() {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [form, setForm] = useState<ClaimForm>({ incidentType: '', dateOfIncident: today(), description: '', location: '', policyType: '' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.form) setForm(parsed.form);
        if (parsed.step && parsed.step <= 2) setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Save draft
  useEffect(() => {
    if (step <= 2) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
    }
  }, [form, step]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    for (const file of arr) {
      if (photos.length >= MAX_FILES) { toast.error(`Maximum ${MAX_FILES} photos allowed`); return; }
      if (!ACCEPTED_TYPES.includes(file.type)) { toast.error(`${file.name}: Only JPG, PNG, WEBP, HEIC accepted`); continue; }
      if (file.size > MAX_SIZE) { toast.error(`${file.name}: File exceeds 10MB limit`); continue; }
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);
      const photo: UploadedPhoto = { id, file, preview, progress: 0, status: 'uploading' };
      setPhotos(prev => {
        if (prev.length >= MAX_FILES) return prev;
        return [...prev, photo];
      });
      // Simulate upload progress
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 30 + 10;
        if (prog >= 100) { prog = 100; clearInterval(interval); }
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, progress: Math.min(prog, 100), status: prog >= 100 ? 'done' : 'uploading' } : p));
      }, 200);
    }
  }, [photos.length]);

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); };

  const fileToBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const s = r.result as string; res(s.split(',')[1]); };
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const getMediaType = (file: File) => {
    if (file.type === 'image/heic' || file.type === 'image/heif') return 'image/jpeg';
    return file.type;
  };

  const analyzeWithAI = async () => {
    if (photos.length === 0) return;
    setIsAnalyzing(true); setAnalyzeProgress(0); setStep(3);

    const progressInterval = setInterval(() => {
      setAnalyzeProgress(prev => prev >= 90 ? 90 : prev + Math.random() * 8 + 2);
    }, 500);

    try {
      // Build Gemini image parts
      const imageParts = await Promise.all(photos.map(async (p) => ({
        inlineData: { mimeType: getMediaType(p.file), data: await fileToBase64(p.file) }
      })));

      const systemPrompt = `You are an expert insurance damage assessor with 20+ years of experience. Analyze the provided accident/damage photographs and return ONLY valid JSON (no markdown, no extra text, no code fences) with this exact structure:
{"damageSummary":"2-3 sentence overview of all visible damage","damageItems":[{"item":"specific damaged component","severity":"Low | Medium | High | Total Loss","estimatedCostINR":number,"repairType":"Repair | Replace | Inspect","notes":"specific observation"}],"totalEstimatedClaimINR":number,"claimFilingChecklist":["array of required documents and steps"],"recommendedActions":["array of immediate next steps"],"confidenceLevel":number between 0 and 100,"urgencyLevel":"Immediate | Within 24hrs | Within 7 days | Non-urgent","additionalNotes":"anything else the claimant should know"}
Base all cost estimates on current Indian market rates (INR).`;

      const userText = `Incident Type: ${form.incidentType}\nDate: ${form.dateOfIncident}\nDescription: ${form.description}\nLocation: ${form.location}\nPolicy Type: ${form.policyType}\n\nPlease analyze the uploaded damage photographs and provide your assessment.`;

      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [...imageParts, { text: userText }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Gemini API error body:', errBody);
        throw new Error(`Gemini API error: ${response.status}`);
      }
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Strip markdown code fences if present
      const cleanText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid AI response format');
      const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);
      setResult(parsed);
      setAnalyzeProgress(100);
      toast.success('🎯 Gemini AI Analysis Complete!');
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      toast.error(`Analysis failed: ${err.message}`);
      // Provide demo result on error so UI can still be tested
      setResult({
        damageSummary: 'Analysis could not be completed via API. This is a demo result showing the UI capabilities. In production, the AI would analyze your uploaded photos and provide real damage assessments.',
        damageItems: [
          { item: 'Front Bumper', severity: 'High', estimatedCostINR: 25000, repairType: 'Replace', notes: 'Significant deformation detected' },
          { item: 'Headlight Assembly (Left)', severity: 'Total Loss', estimatedCostINR: 15000, repairType: 'Replace', notes: 'Completely shattered' },
          { item: 'Hood Panel', severity: 'Medium', estimatedCostINR: 18000, repairType: 'Repair', notes: 'Dents and paint damage' },
          { item: 'Fender (Left)', severity: 'Low', estimatedCostINR: 8000, repairType: 'Repair', notes: 'Minor scratches' },
        ],
        totalEstimatedClaimINR: 66000,
        claimFilingChecklist: ['FIR Copy / Police Report', 'Driving License Copy', 'Vehicle RC Copy', 'Insurance Policy Document', 'Damage Photographs (multiple angles)', 'Repair Estimate from Authorized Workshop'],
        recommendedActions: ['File FIR at nearest police station', 'Do not move vehicle if possible', 'Contact insurance helpline within 24 hours', 'Get repair estimate from network garage'],
        confidenceLevel: 78,
        urgencyLevel: 'Within 24hrs',
        additionalNotes: 'This is a demo result. Add your Gemini API key in .env (VITE_GEMINI_API_KEY) for real AI analysis.'
      });
      setAnalyzeProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    setPhotos([]); setForm({ incidentType: '', dateOfIncident: today(), description: '', location: '', policyType: '' });
    setResult(null); setStep(1); setCheckedItems({}); setAnalyzeProgress(0);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Ready for a new claim');
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const addLine = (text: string, size = 10, bold = false) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(lines, 20, y);
      y += lines.length * (size * 0.5) + 4;
    };
    addLine('IntelliClaim - Accident Damage Report', 18, true);
    addLine(`Generated: ${new Date().toLocaleString('en-IN')}`, 9);
    y += 6;
    addLine('INCIDENT DETAILS', 13, true);
    addLine(`Type: ${form.incidentType}  |  Date: ${form.dateOfIncident}  |  Location: ${form.location}`);
    addLine(`Policy: ${form.policyType}`);
    addLine(`Description: ${form.description}`);
    y += 6;
    addLine('DAMAGE SUMMARY', 13, true);
    addLine(result.damageSummary);
    y += 6;
    addLine('DAMAGE BREAKDOWN', 13, true);
    result.damageItems.forEach((d, i) => {
      addLine(`${i + 1}. ${d.item} — ${d.severity} — ${formatIndianRupees(d.estimatedCostINR)} — ${d.repairType}`);
      if (d.notes) addLine(`   Notes: ${d.notes}`, 9);
    });
    y += 6;
    addLine(`TOTAL ESTIMATED CLAIM: ${formatIndianRupees(result.totalEstimatedClaimINR)}`, 14, true);
    addLine(`Urgency: ${result.urgencyLevel}  |  AI Confidence: ${result.confidenceLevel}%`);
    y += 6;
    addLine('CLAIM FILING CHECKLIST', 13, true);
    result.claimFilingChecklist.forEach((c, i) => addLine(`☐ ${c}`));
    y += 6;
    addLine('RECOMMENDED ACTIONS', 13, true);
    result.recommendedActions.forEach((a, i) => addLine(`${i + 1}. ${a}`));
    if (result.additionalNotes) { y += 6; addLine('ADDITIONAL NOTES', 13, true); addLine(result.additionalNotes); }
    y += 10;
    addLine('Disclaimer: This is an AI-generated estimate for reference only.', 8);
    doc.save(`IntelliClaim_Report_${Date.now()}.pdf`);
    toast.success('PDF report downloaded!');
  };

  // ── Step Indicator ──
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[{ n: 1, label: 'Upload Photos', icon: <Camera className="w-4 h-4" /> },
        { n: 2, label: 'Incident Details', icon: <FileText className="w-4 h-4" /> },
        { n: 3, label: 'AI Results', icon: <Brain className="w-4 h-4" /> }].map((s, i) => (
        <React.Fragment key={s.n}>
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${step === s.n ? 'bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-white shadow-lg' : step > s.n ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { if (s.n < step || (s.n === 2 && photos.length > 0)) setStep(s.n); }}
          >
            {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.icon}
            <span className="hidden sm:inline">{s.label}</span>
          </motion.div>
          {i < 2 && <div className={`w-8 sm:w-16 h-0.5 mx-1 ${step > s.n ? 'bg-green-400' : 'bg-border'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  // ── Step 1: Photo Upload ──
  const PhotoUploadStep = () => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ImagePlus className="w-5 h-5 text-[#0066FF]" /> Upload Accident / Damage Photos
          </CardTitle>
          <CardDescription>Upload up to {MAX_FILES} photos (JPG, PNG, WEBP, HEIC · max 10MB each)</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragOver ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 scale-[1.02]' : 'border-border/50 hover:border-[#0066FF]/50'} ${photos.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDrop} onClick={() => photos.length < MAX_FILES && fileInputRef.current?.click()}
            whileHover={{ scale: photos.length < MAX_FILES ? 1.01 : 1 }}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragOver ? 'text-[#8B5CF6]' : 'text-muted-foreground'}`} />
            <p className="font-medium mb-1">{isDragOver ? 'Drop photos here!' : 'Drag & drop photos or click to browse'}</p>
            <p className="text-xs text-muted-foreground">{photos.length}/{MAX_FILES} photos uploaded</p>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif" multiple className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
          </motion.div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
              {photos.map(p => (
                <motion.div key={p.id} className="relative group rounded-xl overflow-hidden border border-border/50 aspect-square"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <img src={p.preview} alt="damage" className="w-full h-full object-cover" />
                  {p.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-3/4"><Progress value={p.progress} className="h-1.5" /></div>
                    </div>
                  )}
                  <button onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                    <X className="w-3 h-3" />
                  </button>
                  {p.status === 'done' && <div className="absolute bottom-1 left-1"><CheckCircle className="w-4 h-4 text-green-400 drop-shadow" /></div>}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-white px-8" disabled={photos.length === 0}
          onClick={() => setStep(2)}><span>Next: Incident Details</span><ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </motion.div>
  );

  // ── Step 2: Claim Form ──
  const ClaimFormStep = () => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><FileText className="w-5 h-5 text-[#8B5CF6]" /> Incident Details</CardTitle>
          <CardDescription>Provide context to help the AI produce an accurate assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Incident Type *</label>
              <select value={form.incidentType} onChange={e => setForm(f => ({ ...f, incidentType: e.target.value }))}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40">
                <option value="">Select type...</option>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Date of Incident *</label>
              <input type="date" value={form.dateOfIncident} max={today()}
                onChange={e => setForm(f => ({ ...f, dateOfIncident: e.target.value }))}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location of Incident</label>
              <input type="text" placeholder="e.g. MG Road, Bengaluru" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Policy Type</label>
              <select value={form.policyType} onChange={e => setForm(f => ({ ...f, policyType: e.target.value }))}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40">
                <option value="">Select policy...</option>
                {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Brief Description <span className="text-muted-foreground">({form.description.length}/500)</span></label>
            <textarea maxLength={500} rows={4} placeholder="Describe the incident briefly..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 resize-none" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-2" />Back</Button>
        <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#0066FF] text-white px-8" disabled={!form.incidentType || !form.dateOfIncident || photos.length === 0}
          onClick={analyzeWithAI}><Brain className="w-4 h-4 mr-2" /><span>Analyze Damage</span></Button>
      </div>
    </motion.div>
  );

  // ── Step 3: Results ──
  const ResultsStep = () => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
      {isAnalyzing ? (
        <Card className="bg-gradient-to-br from-[#0066FF]/5 to-[#8B5CF6]/5">
          <CardContent className="py-16 text-center space-y-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Brain className="w-16 h-16 mx-auto text-[#8B5CF6]" />
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Analyzing with AI...</h3>
              <p className="text-muted-foreground text-sm">Gemini AI is examining your damage photos</p>
            </div>
            <div className="max-w-md mx-auto"><Progress value={analyzeProgress} className="h-2" /></div>
            <p className="text-xs text-muted-foreground">{Math.round(analyzeProgress)}% complete</p>
          </CardContent>
        </Card>
      ) : result ? (
        <>
          {/* 1. Damage Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-800/30">
            <CardContent className="py-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-blue-600" /> Damage Summary</h3>
              <p className="text-muted-foreground leading-relaxed">{result.damageSummary}</p>
            </CardContent>
          </Card>

          {/* 2. Damage Breakdown Table */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5" /> Damage Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">Item</th><th className="text-left py-3 px-2 font-semibold">Severity</th>
                    <th className="text-right py-3 px-2 font-semibold">Est. Cost (INR)</th><th className="text-left py-3 px-2 font-semibold">Action</th>
                    <th className="text-left py-3 px-2 font-semibold">Notes</th>
                  </tr></thead>
                  <tbody>
                    {result.damageItems.map((d, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 font-medium">{d.item}</td>
                        <td className="py-3 px-2"><Badge className={`${severityColor(d.severity)} border text-xs`}>{d.severity}</Badge></td>
                        <td className="py-3 px-2 text-right font-semibold">{formatIndianRupees(d.estimatedCostINR)}</td>
                        <td className="py-3 px-2"><Badge variant="outline" className="text-xs">{d.repairType}</Badge></td>
                        <td className="py-3 px-2 text-muted-foreground text-xs max-w-[200px]">{d.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 3. Total Claim + 4. Urgency */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-[#0066FF]/10 to-[#8B5CF6]/10 border-[#0066FF]/20">
              <CardContent className="py-8 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Estimated Claim Value</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">
                  {formatIndianRupees(result.totalEstimatedClaimINR)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-8 text-center space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Urgency Level</p>
                <Badge className={`${urgencyColor(result.urgencyLevel)} text-lg px-6 py-2`}>{result.urgencyLevel}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* 5. Checklist + 6. Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="w-5 h-5 text-green-600" /> Claim Filing Checklist</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.claimFilingChecklist.map((c, i) => (
                  <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={!!checkedItems[i]} onChange={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="w-4 h-4 rounded border-border accent-[#0066FF]" />
                    <span className={`text-sm ${checkedItems[i] ? 'line-through text-muted-foreground' : ''}`}>{c}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-amber-500" /> Recommended Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {result.recommendedActions.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-white text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 7. Confidence */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-purple-600" /> AI Confidence Level</h3>
                <span className="text-2xl font-bold text-[#8B5CF6]">{result.confidenceLevel}%</span>
              </div>
              <Progress value={result.confidenceLevel} className="h-3 mb-3" />
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="w-3 h-3" /> This is an AI-generated estimate for reference purposes only. Actual claim amounts may vary after professional assessment.</p>
            </CardContent>
          </Card>

          {result.additionalNotes && (
            <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/20">
              <CardContent className="py-4">
                <p className="text-sm flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{result.additionalNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* 8. Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-white" onClick={exportPDF}><Download className="w-4 h-4 mr-2" /> Export as PDF</Button>
            <Button variant="outline" onClick={resetAll}><RotateCcw className="w-4 h-4 mr-2" /> Start New Claim</Button>
          </div>
        </>
      ) : null}
    </motion.div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/20 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Accident <span className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">Claim Analyzer</span>
        </h1>
        <p className="text-muted-foreground">Upload damage photos and get an instant AI-powered claim estimate</p>
      </motion.div>
      <StepIndicator />
      <AnimatePresence mode="wait">
        {step === 1 && <PhotoUploadStep key="s1" />}
        {step === 2 && <ClaimFormStep key="s2" />}
        {step === 3 && <ResultsStep key="s3" />}
      </AnimatePresence>
    </div>
  );
}
