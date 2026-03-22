import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Rotate3D, ZoomIn, Info, AlertCircle, Scan } from 'lucide-react';

interface DamagePoint {
    id: string;
    x: number;
    y: number;
    label: string;
    severity: 'low' | 'medium' | 'high';
    view: 'front' | 'side' | 'rear';
}

export function DamageMapper() {
    const [currentView, setCurrentView] = useState<'front' | 'side' | 'rear'>('front');
    const [selectedPoint, setSelectedPoint] = useState<DamagePoint | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // Mock damage points detected by AI
    const damagePoints: DamagePoint[] = [
        { id: 'd1', x: 30, y: 45, label: 'Headlight Crack', severity: 'medium', view: 'front' },
        { id: 'd2', x: 65, y: 70, label: 'Bumper Dent', severity: 'low', view: 'front' },
        { id: 'd3', x: 50, y: 50, label: 'Side Door Scratch', severity: 'high', view: 'side' },
        { id: 'd4', x: 20, y: 30, label: 'Fender Bender', severity: 'medium', view: 'side' },
        { id: 'd5', x: 50, y: 60, label: 'Tail Light Broken', severity: 'medium', view: 'rear' },
    ];

    const currentPoints = damagePoints.filter(p => p.view === currentView);

    // Simulated Car Shapes (Abstraction for the Hologram)
    const renderCarShape = () => {
        switch (currentView) {
            case 'front':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                        <path d="M20,60 Q20,30 50,30 Q80,30 80,60 L85,80 L15,80 L20,60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400" />
                        <path d="M25,60 L75,60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400/50" />
                        <rect x="25" y="65" width="15" height="5" rx="1" fill="none" stroke="currentColor" className="text-cyan-400/80" />
                        <rect x="60" y="65" width="15" height="5" rx="1" fill="none" stroke="currentColor" className="text-cyan-400/80" />
                    </svg>
                );
            case 'side':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,102,255,0.3)]">
                        <path d="M10,70 Q15,40 35,35 L65,35 Q85,40 90,60 L95,75 L5,75 L10,70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400" />
                        <circle cx="25" cy="75" r="8" fill="none" stroke="currentColor" className="text-blue-400/50" />
                        <circle cx="75" cy="75" r="8" fill="none" stroke="currentColor" className="text-blue-400/50" />
                    </svg>
                );
            case 'rear':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,107,53,0.3)]">
                        <path d="M20,60 Q20,30 50,30 Q80,30 80,60 L85,80 L15,80 L20,60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
                        <rect x="35" y="65" width="30" height="5" rx="1" fill="none" stroke="currentColor" className="text-purple-400/80" />
                    </svg>
                );
        }
    };

    return (
        <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />

            <CardHeader className="border-b border-white/5 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2 text-xl tracking-wide">
                            <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">3D Damage Inspector</span>
                        </CardTitle>
                        <CardDescription className="text-cyan-500/50 text-xs uppercase tracking-widest">
                            AI Visual Twin • {currentView} View
                        </CardDescription>
                    </div>
                    <div className="flex space-x-1 bg-black/50 p-1 rounded-lg border border-white/10">
                        {(['front', 'side', 'rear'] as const).map((view) => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${currentView === view
                                        ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                                        : 'text-muted-foreground hover:text-white'
                                    }`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="h-[400px] relative mt-4">
                {/* Main Hologram Stage */}
                <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]"
                        >
                            {/* Car Wireframe */}
                            {renderCarShape()}

                            {/* Damage Hotspots */}
                            {currentPoints.map((point) => (
                                <motion.button
                                    key={point.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.2 }}
                                    onClick={() => setSelectedPoint(point)}
                                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                    className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 flex items-center justify-center
                                    ${selectedPoint?.id === point.id ? 'bg-white border-white scale-125 shadow-[0_0_20px_white]' : ''}
                                    ${point.severity === 'high' ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_red]' :
                                            point.severity === 'medium' ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_15px_orange]' :
                                                'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_yellow]'}
                                `}
                                >
                                    <div className={`w-2 h-2 rounded-full ${point.severity === 'high' ? 'bg-red-500' :
                                            point.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-400'
                                        }`} />
                                </motion.button>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Scanning Laser Effect */}
                    {isScanning && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent w-full h-[20px] pointer-events-none"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                </div>

                {/* Info Panel Overlay */}
                <AnimatePresence>
                    {selectedPoint && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-4 right-4 w-64 bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-white">{selectedPoint.label}</h4>
                                <Badge variant="outline" className={`${selectedPoint.severity === 'high' ? 'border-red-500 text-red-500' :
                                        selectedPoint.severity === 'medium' ? 'border-orange-500 text-orange-500' :
                                            'border-yellow-400 text-yellow-400'
                                    }`}>
                                    {selectedPoint.severity.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                                AI detected {selectedPoint.severity} severity damage on the {selectedPoint.view} profile.
                                Estimated repair coverage required.
                            </p>
                            <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-xs h-8">
                                View Detailed Analysis
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls */}
                <div className="absolute bottom-4 left-4 flex space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-cyan-500/30 text-cyan-400 bg-black/40 hover:bg-cyan-500/20"
                        onClick={() => setIsScanning(!isScanning)}
                    >
                        <Scan className={`w-4 h-4 ${isScanning ? 'animate-pulse' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="border-cyan-500/30 text-cyan-400 bg-black/40 hover:bg-cyan-500/20">
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-cyan-500/30 text-cyan-400 bg-black/40 hover:bg-cyan-500/20">
                        <Rotate3D className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
