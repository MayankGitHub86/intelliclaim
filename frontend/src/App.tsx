import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/theme-provider';
import { Auth } from './components/auth';
import { LandingPage } from './components/landing-page';
import { DocumentProcessor } from './components/document-processor';
import { WorkflowBuilder } from './components/workflow-builder';
import { VisionInspector } from './components/vision-inspector';
import { Settings } from './components/settings';
import { Navigation } from './components/navigation';

import { Toaster } from './components/ui/sonner';
import { ErrorFallback, useErrorHandler } from './components/ErrorBoundary';
import { apiClient, API_CONFIG } from './config/api';
import { toast } from 'sonner';

type Page = 'landing' | 'auth' | 'documents' | 'workflows' | 'vision' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const { handleError, resetError, handleAsyncError } = useErrorHandler();

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiClient.setToken(token);
          
          // Verify token by fetching user profile
          const profile = await apiClient.get(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
          setUserProfile(profile);
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        }
      } catch (error: any) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        apiClient.setToken('');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(checkAuthStatus, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setCurrentPage('documents');
    toast.success('Welcome to IntelliClaim!');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    apiClient.setToken('');
    setIsAuthenticated(false);
    setUserProfile(null);
    setCurrentPage('landing');
    toast.success('Logged out successfully');
  };

  const handleStartTrial = async () => {
    if (isAuthenticated) {
      setCurrentPage('documents'); // Redirect to Smart Prediction System
    } else {
      setIsLoading(true);
      
      try {
        // Try to create a trial user with backend
        const timestamp = Date.now();
        const trialUserData = {
          email: `trial-user-${timestamp}@intelliclaim.trial`,
          password: 'TrialPass123!',
          name: `Trial User ${timestamp.toString().slice(-4)}`
        };
        
        // Register trial user
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, trialUserData);
        
        // Login with trial user
        const loginResponse = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: trialUserData.email,
          password: trialUserData.password
        });
        
        // Set authentication
        const token = loginResponse.access_token;
        localStorage.setItem('auth_token', token);
        apiClient.setToken(token);
        setUserProfile(loginResponse.user);
        setIsAuthenticated(true);
        setIsTrialUser(true);
        
        toast.success('🎉 Welcome to your free trial! Explore the Smart Prediction System.');
        
      } catch (error: any) {
        console.error('Backend unavailable, proceeding with offline trial:', error);
        
        // Backend is down - create offline trial session
        const timestamp = Date.now();
        setUserProfile({
          name: `Trial User ${timestamp.toString().slice(-4)}`,
          email: `trial-user-${timestamp}@intelliclaim.trial`,
          id: timestamp
        });
        setIsAuthenticated(true);
        setIsTrialUser(true);
        
        toast.success('🎉 Welcome to your offline trial! Explore the Smart Prediction System.');
      } finally {
        setIsLoading(false);
        // Always redirect to Smart Prediction System regardless of backend status
        setCurrentPage('documents');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0066FF] via-[#8B5CF6] to-[#667eea] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.h1
            className="text-4xl font-bold text-white mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            IntelliClaim
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Initializing AI Systems...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const pageComponents = {
    landing: <LandingPage 
      isAuthenticated={isAuthenticated}
      onAuthenticated={handleAuthenticated}
      onEnterApp={handleStartTrial}
      onShowAuth={() => setCurrentPage('auth')}
    />,
    auth: <Auth 
      onAuthenticated={handleAuthenticated}
      onBackToLanding={() => setCurrentPage('landing')}
    />,
    documents: <DocumentProcessor />,
    workflows: <WorkflowBuilder />,
    vision: <VisionInspector />,
    settings: <Settings 
      isTrialUser={isTrialUser}
      onUpgrade={() => setCurrentPage('landing')}
      userProfile={userProfile}
    />
  };  return (
    <ThemeProvider defaultTheme="light" storageKey="intelliclaim-theme">
      <div className="min-h-screen bg-background">
        {currentPage === 'landing' ? (
          pageComponents.landing
        ) : currentPage === 'auth' ? (
          pageComponents.auth
        ) : (
          <div className="flex min-h-screen">
            <Navigation 
              currentPage={currentPage} 
              onPageChange={setCurrentPage}
              onBackToLanding={() => {
                setCurrentPage('landing');
                setIsTrialUser(false);
              }}
              onLogout={handleLogout}
              isTrialUser={isTrialUser}
              onUpgrade={() => {}} // Auth is now handled within landing page
            />
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-full"
                >
                  {pageComponents[currentPage]}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}