import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Brain,
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const SLIDE_DURATION_MS = 5000;

const formatAltText = (value: string) => {
  const baseName = value.replace(/\.[^/.]+$/, '');
  const words = baseName.split(/[-_]+/).filter(Boolean);
  if (!words.length) {
    return 'Dashboard Slide';
  }
  return words
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

// Dashboard preview data with asset images
const DASHBOARD_SLIDES = [
  {
    src: '/src/assets/dashboard-analytics.svg',
    alt: 'Dashboard Analytics - Claims processing and performance metrics'
  },
  {
    src: '/src/assets/ai-insights.svg',
    alt: 'AI Smart Prediction System - Machine learning insights and accuracy'
  },
  {
    src: '/src/assets/claims-overview.svg',
    alt: 'Claims Management Hub - Real-time processing and status overview'
  }
];



interface HeroSectionProps {
  onEnterApp: () => void;
  openAuthModal: (loginMode?: boolean) => void;
  isAuthenticated: boolean;
}

export function HeroSection({ onEnterApp, openAuthModal, isAuthenticated }: HeroSectionProps) {
  const [claimsProcessed, setClaimsProcessed] = useState(47823);
  const [activeSlide, setActiveSlide] = useState(0);

  const slidesLength = DASHBOARD_SLIDES.length;
  const currentSlide = slidesLength > 0 ? DASHBOARD_SLIDES[activeSlide % slidesLength] : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setClaimsProcessed(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (slidesLength <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slidesLength);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(interval);
  }, [slidesLength]);

  return (
    <section className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-32 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 border border-[#8B5CF6]/20 rounded-full px-4 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-sm font-medium">AI-Powered Insurance Revolution</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#0066FF] via-[#8B5CF6] to-[#667eea] bg-clip-text text-transparent">
                Revolutionary
              </span>
              <br />
              AI Insurance
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Process claims in <span className="font-semibold text-[#00FF88]">seconds, not days</span>.
              Our advanced AI platform transforms insurance processing with unprecedented speed and accuracy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED] text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto"
                onClick={onEnterApp}
              >
                {isAuthenticated ? 'Enter Dashboard' : 'Start Free Trial'}
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto"
                onClick={() => openAuthModal(true)}
              >
                <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                {isAuthenticated ? 'Watch Demo' : 'Login'}
              </Button>
            </div>

            {/* Live Stats */}
            <motion.div
              className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm border border-border/50 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#00FF88] rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live Processing</span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                <span className="font-bold text-base sm:text-lg">{claimsProcessed.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">claims processed</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative z-10">
              <Card className="p-2 bg-background/95 backdrop-blur-sm border-2 border-border/50 shadow-2xl rounded-3xl">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/50 to-background border border-border/30">
                  {currentSlide && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full relative"
                      >
                        <img
                          src={currentSlide.src}
                          alt={currentSlide.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRhc2hib2FyZCBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent flex flex-col justify-end p-4">
                          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                            <h3 className="font-semibold text-sm mb-1">AI Dashboard</h3>
                            <p className="text-xs text-muted-foreground">Real-time claim processing analytics</p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {!currentSlide && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] rounded-2xl flex items-center justify-center">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">Dashboard Preview</h3>
                        <p className="text-sm text-muted-foreground">See your AI-powered analytics</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Navigation Dots */}
                {slidesLength > 1 && (
                  <div className="flex justify-center space-x-2 mt-4 mb-2">
                    {DASHBOARD_SLIDES.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeSlide % slidesLength
                          ? 'bg-[#0066FF] w-6'
                          : 'bg-border hover:bg-muted-foreground'
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Background Elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0066FF]/5 via-[#8B5CF6]/5 to-[#06B6D4]/5 rounded-3xl blur-xl" />
            <div className="absolute top-8 -right-8 w-24 h-24 bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] rounded-full blur-2xl opacity-20" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#00FF88] to-[#00D4AA] rounded-full blur-2xl opacity-15" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
