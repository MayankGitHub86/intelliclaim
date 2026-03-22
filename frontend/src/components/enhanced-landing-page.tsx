import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Globe, 
  BarChart3, 
  Layers,
  ChevronRight,
  Play,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ThemeToggle } from './ui/theme-toggle';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { apiClient, API_CONFIG } from '../config/api';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

// --- Spotlight Navbar Component ---
const SpotlightNavbar = ({ isAuthenticated, onEnterApp, openAuthModal }: any) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Pricing', href: '#pricing' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-2 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? 'bg-black/60 shadow-2xl' : 'bg-white/5'
      }`}
      initial={{ y: -100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="flex items-center gap-1 px-4 mr-4">
        <Brain className="w-6 h-6 text-blue-500" />
        <span className="font-bold text-white hidden md:block">IntelliClaim</span>
      </div>

      <div className="hidden md:flex items-center gap-1 relative">
        {navItems.map((item, index) => (
          <a
            key={item.name}
            href={item.href}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative px-4 py-2 text-sm text-white/70 hover:text-white transition-colors duration-200"
          >
            {hoveredIndex === index && (
              <motion.div
                layoutId="navbar-highlight"
                className="absolute inset-0 bg-white/10 rounded-full"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              />
            )}
            {item.name}
          </a>
        ))}
      </div>

      <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />

      <div className="flex items-center gap-2 px-1">
        <ThemeToggle />
        {isAuthenticated ? (
          <Button 
            onClick={onEnterApp}
            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white border-0 px-6"
          >
            Dashboard
          </Button>
        ) : (
          <Button 
            onClick={() => openAuthModal(true)}
            className="rounded-full bg-white text-black hover:bg-white/90 border-0 px-6"
          >
            Sign In
          </Button>
        )}
      </div>
    </motion.nav>
  );
};

// --- Spotlight Card Component ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-3xl border border-white/10 bg-white/5 p-8 overflow-hidden group ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
          opacity,
        }}
      />
      {children}
    </div>
  );
};

// --- Main Enhanced Landing Page ---
export function EnhancedLandingPage({ onEnterApp, openAuthModal: parentOpenAuthModal, isAuthenticated, onAuthenticated }: any) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setShowAuthModal(true);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const decoded: any = jwtDecode(credentialResponse.credential);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        credential: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });
      
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        apiClient.setToken(response.access_token);
        toast.success(`Welcome ${decoded.name}!`);
        if (onAuthenticated) onAuthenticated();
        setShowAuthModal(false);
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      toast.error(error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => toast.error('Google Sign-In failed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }

      if (isLogin) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });
        if (response.access_token) {
          localStorage.setItem('auth_token', response.access_token);
          apiClient.setToken(response.access_token);
          toast.success("Welcome back!");
        }
      } else {
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        const loginResponse = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });
        if (loginResponse.access_token) {
          localStorage.setItem('auth_token', loginResponse.access_token);
          apiClient.setToken(loginResponse.access_token);
          toast.success("Account created!");
        }
      }
      if (onAuthenticated) onAuthenticated();
      setShowAuthModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-[#030711] text-white selection:bg-blue-500/30 overflow-x-hidden pt-32">
      <SpotlightNavbar 
        isAuthenticated={isAuthenticated} 
        onEnterApp={onEnterApp} 
        openAuthModal={openAuthModal} 
      />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ y: yRange, opacity: opacityRange }}
            className="flex flex-col items-center"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
                <Zap className="w-4 h-4" />
                <span>Gemini 2.5 Flash Powered</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-[1.1]">
                Revolutionizing Insurance<br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text">With Pure Intelligence.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
                Experience the world's most advanced claim processing engine. 
                99.9% accuracy, real-time computer vision, and autonomous workflows.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                    size="lg"
                    onClick={() => isAuthenticated ? onEnterApp() : openAuthModal(false)}
                    className="h-14 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    Start Processing Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                    variant="outline"
                    size="lg"
                    className="h-14 px-10 rounded-full border-white/10 hover:bg-white/5 text-white font-bold transition-all"
                >
                    <Play className="mr-2 w-4 h-4 fill-current" />
                    Watch Demo
                </Button>
            </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative mt-20 w-full max-w-6xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl p-2 shadow-2xl overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
            <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
                alt="Dashboard Preview"
                className="w-full h-auto rounded-2xl border border-white/5"
            />
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the next generation of insurers.</h2>
                <p className="text-lg text-white/50">Everything you need to automate your claim cycle from detection to payment.</p>
            </div>
            <Button variant="link" className="text-blue-400 group h-auto p-0">
                View all features <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <SpotlightCard>
                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                    <Cpu className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Neural Vision Engine</h3>
                <p className="text-white/50 leading-relaxed mb-6">
                    Our proprietary YOLOv8 models detect damage with sub-millimeter precision.
                </p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">99.8% Recall</span>
                </div>
            </SpotlightCard>

            <SpotlightCard>
                <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                    <Layers className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Autonomous Workflows</h3>
                <p className="text-white/50 leading-relaxed mb-6">
                    Drag-and-drop complexity into simple, high-performance automation nodes.
                </p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">No-Code</span>
                </div>
            </SpotlightCard>

            <SpotlightCard>
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                    <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">Enterprise Compliance</h3>
                <p className="text-white/50 leading-relaxed mb-6">
                    Bank-grade encryption and GDPR compliance baked into every transaction.
                </p>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">SOC2 Ready</span>
                </div>
            </SpotlightCard>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white/5 border-y border-white/10 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
            <h4 className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mb-12 text-center">Trusted by Global Leaders</h4>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                <Globe className="w-12 h-12" />
                <BarChart3 className="w-12 h-12" />
                <Cpu className="w-12 h-12" />
                <Shield className="w-12 h-12" />
                <Layers className="w-12 h-12" />
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-20 border-t border-white/5 mt-20">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold">IntelliClaim</span>
                </div>
                <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
                    Setting the new standard for insurance processing with artificial intelligence. 
                    Building the future of finance, today.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><Github className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><Twitter className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"><Linkedin className="w-4 h-4" /></a>
                </div>
            </div>
            <div>
                <h5 className="font-bold mb-6">Product</h5>
                <ul className="space-y-4 text-white/40 text-sm">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Solutions</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Releases</a></li>
                </ul>
            </div>
            <div>
                <h5 className="font-bold mb-6">Company</h5>
                <ul className="space-y-4 text-white/40 text-sm">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                </ul>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/20 font-bold uppercase tracking-widest">
            <p>© 2026 IntelliClaim Vision AI. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">GDPR</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/80 border-white/10 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden relative group">
                {/* Accent Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none" />
                
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative text-center mb-8">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                  <p className="text-white/40 text-sm mt-2">
                    {isLogin ? 'Enter your details to access your dashboard' : 'Join the future of insurance processing'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="enhance-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          id="enhance-name"
                          placeholder="John Doe"
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="enhance-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        id="enhance-email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10 bg-white/5 border-white/10 text-white"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enhance-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        id="enhance-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="enhance-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                          id="enhance-confirm"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 h-11 rounded-xl font-bold"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-black px-4 text-white/20 font-bold">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    width="100%"
                  />
                </div>

                <div className="mt-8 text-center text-sm">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
