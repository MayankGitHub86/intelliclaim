import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mic, Square, Loader2, Activity, Fingerprint, Lock } from 'lucide-react';
import { apiClient, API_CONFIG } from '../config/api';
import { toast } from 'sonner';

export function VoiceAnalyzer() {
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<number | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setAnalysisResult(null);
            setTimer(0);
            timerRef.current = window.setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Could not access microphone. Please allow permissions.");
        }
    };

    const stopRecording = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsAnalyzing(true);

            mediaRecorderRef.current.onstop = async () => {
                try {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    // Create a file from the blob
                    const file = new File([blob], "voice_recording.webm", { type: "audio/webm" });

                    const response = await apiClient.uploadFile(API_CONFIG.ENDPOINTS.FORENSICS.VOICE, file);
                    setAnalysisResult(response);

                    if (response.risk_assessment.risk_level === 'CRITICAL') {
                        toast.error('High stress markers detected in voice sample.');
                    } else {
                        toast.success('Voice analysis completed successfully.');
                    }
                } catch (error) {
                    toast.error('Failed to analyze voice recording');
                    console.error(error);
                } finally {
                    setIsAnalyzing(false);
                    // Stop all tracks to release microphone
                    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
                }
            };
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2 text-xl">
                            <Mic className="w-5 h-5 text-rose-400" />
                            <span>Voice-Print Fraud Detection</span>
                        </CardTitle>
                        <CardDescription>Biometric acoustics & sentiment analysis</CardDescription>
                    </div>
                    {analysisResult && (
                        <Badge className={analysisResult.risk_assessment.risk_level === 'CRITICAL' ? 'bg-red-500' : 'bg-green-500'}>
                            {analysisResult.risk_assessment.risk_level === 'CRITICAL' ? 'HIGH RISK' : 'VERIFIED'}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Recording Interface */}
                    <div className="flex-1 w-full text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                            {isRecording && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute inset-0 bg-rose-500 rounded-full blur-xl"
                                />
                            )}
                            <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center border-4 transition-colors ${isRecording ? 'border-rose-500 bg-rose-500/20' : 'border-white/20 bg-black/20'}`}>
                                {isAnalyzing ? (
                                    <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                                ) : (
                                    <Mic className={`w-8 h-8 ${isRecording ? 'text-rose-500' : 'text-white/50'}`} />
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="font-mono text-2xl font-bold tracking-widest mb-2">
                                {formatTime(timer)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {isRecording ? "Recording Statement..." : isAnalyzing ? "Analyzing Acoustics..." : "Press record to start analysis"}
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    disabled={isAnalyzing}
                                    className="bg-rose-500 hover:bg-rose-600 text-white min-w-[140px]"
                                >
                                    <Mic className="w-4 h-4 mr-2" />
                                    Record
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    variant="destructive"
                                    className="animate-pulse min-w-[140px]"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Analysis Results / Visualization */}
                    <AnimatePresence mode='wait'>
                        {analysisResult ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex-1 w-full space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-xs text-muted-foreground block mb-1">Stress Level</span>
                                        <div className="flex items-center">
                                            <Activity className="w-4 h-4 mr-2 text-rose-400" />
                                            <span className="font-bold">{analysisResult.biometrics.stress_level}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-xs text-muted-foreground block mb-1">Fingerprint ID</span>
                                        <div className="flex items-center">
                                            <Fingerprint className="w-4 h-4 mr-2 text-blue-400" />
                                            <span className="font-mono text-xs">{analysisResult.biometrics.voice_fingerprint_id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-lg border ${analysisResult.risk_assessment.risk_level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                                    <h4 className={`text-sm font-bold mb-2 uppercase ${analysisResult.risk_assessment.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-green-400'}`}>
                                        {analysisResult.risk_assessment.risk_level === 'CRITICAL' ? '⚠️ Deception Indicators' : '✅ Authentication Passed'}
                                    </h4>
                                    {analysisResult.risk_assessment.anomalies_detected.length > 0 ? (
                                        <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                                            {analysisResult.risk_assessment.anomalies_detected.map((anomaly: string, i: number) => (
                                                <li key={i}>{anomaly}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Voice biometrics match expected baseline. No stress anomalies detected.</p>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 hidden md:flex items-center justify-center p-8 opacity-30">
                                <div className="text-center">
                                    <Activity className="w-16 h-16 mx-auto mb-4" />
                                    <p className="text-sm">Acoustic waveform analysis inactive</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
