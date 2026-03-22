import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';
import {
  Brain,
  Zap,
  Shield,
  ArrowRight,
  Eye,
  FileText,
  Workflow,
  Camera,
  Mail,
  Lock,
  User,
  EyeOff,
  X
} from 'lucide-react';
import { ThemeToggle } from './ui/theme-toggle';
import { HeroSection } from './HeroSection';
import { apiClient, API_CONFIG } from '../config/api';

const SLIDE_DURATION_MS = 5000;



interface LandingPageProps {
  onEnterApp: () => void;
  onShowAuth: () => void;
  isAuthenticated: boolean;
  onAuthenticated?: () => void;
}

export function LandingPage({ onEnterApp, onShowAuth, isAuthenticated, onAuthenticated }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });



  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google Login failed: No credential received");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        token: credentialResponse.credential
      });

      // Store the token
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        apiClient.setToken(response.access_token);
        toast.success("Welcome back to IntelliClaim via Google!");
        if (onAuthenticated) {
          onAuthenticated();
        }
        setShowAuthModal(false);
      }
    } catch (error: any) {
      console.error('Google Auth error:', error);
      toast.error(error.message || 'Google Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Login
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });

        if (response.access_token) {
          localStorage.setItem('auth_token', response.access_token);
          apiClient.setToken(response.access_token);
          toast.success("Welcome back to IntelliClaim!");
        }
      } else {
        // Register
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: 'Trial User'
        });

        // Auto-login after registration
        const loginResponse = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.access_token) {
          localStorage.setItem('auth_token', loginResponse.access_token);
          apiClient.setToken(loginResponse.access_token);
          toast.success("Account created successfully!");
        }
      }

      if (onAuthenticated) {
        onAuthenticated();
      }
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Processing",
      description: "Advanced machine learning algorithms process claims in seconds, not days",
      gradient: "from-[#8B5CF6] to-[#06B6D4]",
      delay: 0.1
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Average processing time of 2.3 seconds with 94.7% accuracy",
      gradient: "from-[#00FF88] to-[#00D4AA]",
      delay: 0.2
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with full regulatory compliance",
      gradient: "from-[#FF6B35] to-[#FF1744]",
      delay: 0.3
    }
  ];

  const capabilities = [
    { icon: <FileText className="w-6 h-6" />, label: "Document Analysis", color: "bg-blue-500" },
    { icon: <Camera className="w-6 h-6" />, label: "Computer Vision", color: "bg-purple-500" },
    { icon: <Workflow className="w-6 h-6" />, label: "No-Code Workflows", color: "bg-green-500" },
    { icon: <Eye className="w-6 h-6" />, label: "Real-time Monitoring", color: "bg-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/30 overflow-x-hidden">
      {/* Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300 ${isScrolled
          ? 'bg-background/98 border-b border-border/50 shadow-lg'
          : 'bg-background/95 border-b border-border/30 shadow-sm'
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">
              IntelliClaim
            </span>
          </motion.div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                onClick={onEnterApp}
                className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED] text-sm sm:text-base px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Enter Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => openAuthModal(true)} className="text-sm sm:text-base px-3 sm:px-4">
                  Login
                </Button>
                <Button
                  onClick={() => openAuthModal(false)}
                  className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED] text-sm sm:text-base px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <HeroSection
        onEnterApp={onEnterApp}
        openAuthModal={openAuthModal}
        isAuthenticated={isAuthenticated}
      />

      {/* Our Services Section */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
              Future-Proof <span className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent italic">Solutions</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              We've redesigned insurance processing from the ground up using state-of-the-art neural networks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Brain className="w-6 h-6" />,
                title: 'Neural Engine',
                description: 'Deep learning models that understand context and intent.',
                gradient: 'from-[#0066FF] to-[#8B5CF6]'
              },
              {
                icon: <Eye className="w-6 h-6" />,
                title: 'Vision AI',
                description: 'Advanced computer vision for instant damage assessment.',
                gradient: 'from-[#8B5CF6] to-[#06B6D4]'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Fraud Guard',
                description: 'Statistical classifiers that catch anomalies in real-time.',
                gradient: 'from-[#06B6D4] to-[#00FF88]'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Speed SLA',
                description: 'Guaranteed processing under 3 seconds per claim.',
                gradient: 'from-[#00FF88] to-[#FFD700]'
              }
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card
                  className="p-8 h-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.05] transition-all duration-500 group cursor-pointer overflow-hidden relative"
                  onClick={() => openAuthModal(false)}
                >
                  <div className={`w-14 h-14 mb-8 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                    <div className="text-white drop-shadow-md">
                      {action.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground/90">
                    {action.title}
                  </h3>
                  <p className="text-base text-muted-foreground/80 leading-relaxed mb-6">
                    {action.description}
                  </p>
                  <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </div>

                  {/* Hover decorative element */}
                  <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`} />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-background/50 to-background/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Powered by <span className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">Advanced AI</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of insurance processing with our cutting-edge artificial intelligence platform
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="p-8 h-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50 hover:shadow-2xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Capabilities Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 p-4 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-10 h-10 ${capability.color} rounded-lg flex items-center justify-center text-white`}>
                  {capability.icon}
                </div>
                <span className="font-medium">{capability.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8">
              Ready to <span className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">Transform</span> Your Insurance?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join thousands of organizations already using IntelliClaim to revolutionize their insurance processing
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED] text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 h-auto"
                onClick={onEnterApp}
              >
                {isAuthenticated ? 'Enter Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 h-auto"
                onClick={() => openAuthModal(false)}
              >
                {isAuthenticated ? 'Schedule Demo' : 'Create Account'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-md mx-auto m-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative bg-white/95 dark:bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />

                <div className="relative p-6 sm:p-8">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Tab Switcher */}
                  <div className="flex mb-8 mt-2 p-1 bg-muted/50 backdrop-blur-sm rounded-lg">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${isLogin
                        ? 'bg-background text-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${!isLogin
                        ? 'bg-background text-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.form
                      key={isLogin ? 'login' : 'signup'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative mt-2">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                              id="name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="pl-12"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </motion.div>
                      )}

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-12"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-12 pr-12"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative mt-2">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              className="pl-12"
                              placeholder="Confirm your password"
                            />
                          </div>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED] group"
                      >
                        {loading ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            toast.error("Google Login Failed");
                          }}
                          useOneTap
                          theme="filled_blue"
                          shape="pill"
                          width="100%"
                        />
                      </div>
                    </motion.form>
                  </AnimatePresence>

                  {isLogin && (
                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors underline text-sm"
                      >
                        Forgot your password?
                      </button>
                    </motion.div>
                  )}

                  <motion.div
                    className="mt-8 text-center text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
