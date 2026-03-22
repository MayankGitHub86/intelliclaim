import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles, Shield, Zap, Github, Linkedin } from 'lucide-react';
import { toast } from "sonner";
import { apiClient, API_CONFIG } from '../config/api';

interface AuthProps {
  onAuthenticated: () => void;
  onBackToLanding?: () => void;
}

interface AuthFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  company?: string;
}

export function Auth({ onAuthenticated, onBackToLanding }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    company: ''
  });

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
      apiClient.setToken(response.access_token);
      toast.success("Welcome to IntelliClaim via Google!");
      onAuthenticated();
    } catch (error: any) {
      console.error('Google Auth error:', error);
      toast.error(error.message || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Real login API call
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });

        // Store the token
        apiClient.setToken(response.access_token);
        toast.success("Welcome back to IntelliClaim!");
        onAuthenticated();

      } else {
        // Validation for registration
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }

        if (!formData.name.trim()) {
          toast.error("Name is required");
          setLoading(false);
          return;
        }

        // Real registration API call
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company || 'Default Company'
        });

        // Auto-login after registration
        const loginResponse = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });

        apiClient.setToken(loginResponse.access_token);
        toast.success("Account created successfully!");
        onAuthenticated();
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: "AI-Powered Claims Processing" },
    { icon: Shield, text: "Enterprise-Grade Security" },
    { icon: Zap, text: "Lightning Fast Analytics" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066FF] via-[#8B5CF6] to-[#667eea] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left Side - Branding & Features */}
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {onBackToLanding && (
            <motion.button
              onClick={onBackToLanding}
              className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Landing
            </motion.button>
          )}

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              IntelliClaim
            </h1>
            <p className="text-xl text-white/80 mb-8">
              The future of insurance claims processing is here
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 text-white/90"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />

            <div className="relative p-8">
              {/* Tab Switcher */}
              <div className="flex mb-8 p-1 bg-white/10 backdrop-blur-sm rounded-lg">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${isLogin
                    ? 'bg-white text-[#0066FF] shadow-lg'
                    : 'text-white/70 hover:text-white'
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${!isLogin
                    ? 'bg-white text-[#0066FF] shadow-lg'
                    : 'text-white/70 hover:text-white'
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
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="name" className="text-white/90">Full Name</Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="company" className="text-white/90">Company (Optional)</Label>
                        <div className="relative mt-2">
                          <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <Input
                            id="company"
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
                            placeholder="Enter your company name"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-white/90">Email Address</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
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
                      <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-white/90 text-[#0066FF] shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-[#0066FF] border-t-transparent rounded-full"
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

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#0066FF] px-2 text-white/50">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
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

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                      onClick={() => toast.info("GitHub Login coming soon!")}
                    >
                      <Github className="w-5 h-5" />
                      Continue with GitHub
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                        onClick={() => toast.info("LinkedIn Login coming soon!")}
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                        onClick={() => toast.info("Microsoft Login coming soon!")}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="currentColor" /></svg>
                        Microsoft
                      </Button>
                    </div>
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
                    className="text-white/70 hover:text-white transition-colors underline"
                  >
                    Forgot your password?
                  </button>
                </motion.div>
              )}

              <motion.div
                className="mt-8 text-center text-white/60 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
