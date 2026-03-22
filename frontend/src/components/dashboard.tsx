import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiClient, API_CONFIG } from '../config/api';
import { toast } from 'sonner';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Brain,
  Zap,
  Activity,
  DollarSign,
  Users,
  BarChart3,
  Eye,
  ArrowUpRight,
  Sparkles,
  Settings,
  RefreshCw,
  ShieldAlert,
  Target,
  CloudRain
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { DamageMapper } from './DamageMapper';
import { VoiceAnalyzer } from './VoiceAnalyzer';

interface DashboardMetrics {
  total_claims: number;
  processed_claims: number;
  pending_claims: number;
  accuracy_rate: number;
  avg_processing_time: number;
  cost_savings: number;
}

interface ActivityItem {
  id: string;
  type: 'approved' | 'processing' | 'rejected' | 'pending';
  claim_id: string;
  timestamp: string;
  amount: string;
  description?: string;
}

interface DashboardStats {
  recent_activity: ActivityItem[];
  processing_status: {
    total: number;
    in_progress: number;
    completed: number;
  };
  payout_trends: any[];
  risk_distribution: any[];
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [metrics, setMetrics] = useState({
    total_claims: 0,
    processed_claims: 0,
    pending_claims: 0,
    accuracy_rate: 0,
    avg_processing_time: 0,
    cost_savings: 0
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedXAI, setSelectedXAI] = useState([
    { feature: 'Claim Amount', score: 0.45, impact: 'POSITIVE' },
    { feature: 'Witness Presence', score: -0.2, impact: 'NEGATIVE' },
    { feature: 'Previous Claims', score: 0.15, impact: 'POSITIVE' },
    { feature: 'Urgency Level', score: 0.3, impact: 'POSITIVE' },
    { feature: 'Last Claim Gap', score: -0.1, impact: 'NEGATIVE' },
  ]);
  const [crossCheckResult, setCrossCheckResult] = useState<any>(null);
  const [performingCrossCheck, setPerformingCrossCheck] = useState(false);
  const [weatherForensics, setWeatherForensics] = useState<any>(null);
  const [checkingWeather, setCheckingWeather] = useState(false);

  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Get real-time metrics
      const metricsResponse = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.METRICS);
      setMetrics(metricsResponse);

      // Get recent activity and stats
      const statsResponse = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.STATS);
      setStats(statsResponse);

    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Fallback to mock data for development
      setMetrics({
        total_claims: 2847,
        processed_claims: 2701,
        pending_claims: 146,
        avg_processing_time: 2.3,
        accuracy_rate: 94.7,
        cost_savings: 1250000
      });

      setStats({
        recent_activity: [
          { id: '1', type: 'approved', claim_id: 'C001', timestamp: '2 min ago', amount: '₹50,000' },
          { id: '2', type: 'processing', claim_id: 'C002', timestamp: '5 min ago', amount: '₹25,000' },
          { id: '3', type: 'approved', claim_id: 'C003', timestamp: '8 min ago', amount: '₹75,000' },
          { id: '4', type: 'rejected', claim_id: 'C004', timestamp: '12 min ago', amount: '₹30,000' },
          { id: '5', type: 'approved', claim_id: 'C005', timestamp: '15 min ago', amount: '₹40,000' }
        ],
        processing_status: {
          total: 2847,
          in_progress: 146,
          completed: 2701
        },
        payout_trends: [
          { name: 'Mon', amount: 4000 },
          { name: 'Tue', amount: 3000 },
          { name: 'Wed', amount: 2000 },
          { name: 'Thu', amount: 2780 },
          { name: 'Fri', amount: 1890 },
          { name: 'Sat', amount: 2390 },
          { name: 'Sun', amount: 3490 },
        ],
        risk_distribution: [
          { name: 'Low', count: 65 },
          { name: 'Medium', count: 25 },
          { name: 'High', count: 10 },
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // WebSocket Connection
    const ws = new WebSocket('ws://localhost:8000/ws/dashboard');

    ws.onopen = () => {
      console.log('Connected to Dashboard WebSocket');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === 'NEW_CLAIM') {
        toast.info(`New Claim Received: ${message.data.title}`);
        loadDashboardData(); // Refresh data on new event
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-[#00FF88]" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-[#0066FF] animate-spin" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-[#FF1744]" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'approved':
        return 'bg-[#00FF88]/10 border-[#00FF88]/20';
      case 'processing':
        return 'bg-[#0066FF]/10 border-[#0066FF]/20';
      case 'rejected':
        return 'bg-[#FF1744]/10 border-[#FF1744]/20';
      default:
        return 'bg-muted/50 border-border/50';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/30 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            AI <span className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Real-time insurance processing analytics</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Badge className="bg-gradient-to-r from-[#00FF88] to-[#00D4AA] text-white px-3 sm:px-4 py-2 w-full sm:w-auto justify-center sm:justify-start">
            <Activity className="w-4 h-4 mr-2" />
            {loading ? 'Loading...' : 'Live Processing'}
          </Badge>
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED] w-full sm:w-auto px-4 py-2 rounded-lg text-white flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: 'Total Claims',
            value: loading ? '...' : metrics.total_claims.toLocaleString(),
            change: '+12%',
            icon: <FileText className="w-6 h-6" />,
            gradient: 'from-[#0066FF] to-[#06B6D4]',
            delay: 0.1
          },
          {
            title: 'Processed Today',
            value: loading ? '...' : metrics.processed_claims.toLocaleString(),
            change: '+24%',
            icon: <CheckCircle className="w-6 h-6" />,
            gradient: 'from-[#00FF88] to-[#00D4AA]',
            delay: 0.2
          },
          {
            title: 'Avg Process Time',
            value: loading ? '...' : `${metrics.avg_processing_time}s`,
            change: '-15%',
            icon: <Zap className="w-6 h-6" />,
            gradient: 'from-[#8B5CF6] to-[#06B6D4]',
            delay: 0.3
          },
          {
            title: 'AI Accuracy',
            value: loading ? '...' : `${metrics.accuracy_rate}%`,
            change: '+2%',
            icon: <Brain className="w-6 h-6" />,
            gradient: 'from-[#FF6B35] to-[#FF1744]',
            delay: 0.4
          }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: metric.delay }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="relative overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-500 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {metric.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs bg-white/20 backdrop-blur-md border-white/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/90">{metric.value}</p>
                  <p className="text-sm font-medium text-muted-foreground/80 uppercase tracking-widest">{metric.title}</p>
                </div>
              </CardContent>

              {/* Animated decorative element */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Processing Overview */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <BarChart3 className="w-5 h-5 text-[#0066FF]" />
                    <span>Predictive Payout Analytics</span>
                  </CardTitle>
                  <CardDescription>ML-driven forecasting for claim approvals</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    Fraud Guard Active
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.payout_trends || []}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#0066FF' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#0066FF"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm font-medium">Auto-Decision Rate</span>
                    </div>
                    <span className="text-lg font-bold">82%</span>
                  </div>
                  <Progress value={82} className="h-1.5 bg-white/5" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Target className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-medium">Model Precision</span>
                    </div>
                    <span className="text-lg font-bold">99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-1.5 bg-white/5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Neuro-Reasoning Section (XAI) */}
          <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Explainable AI (XAI) Insight</span>
                  </CardTitle>
                  <CardDescription>Neuro-logical breakdown of AI reasoning</CardDescription>
                </div>
                <Badge className="bg-white/10 text-white border-white/20">Feature Contribution</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/2 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedXAI} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" domain={[-1, 1]} hide />
                      <YAxis
                        dataKey="feature"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {selectedXAI.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.score > 0 ? '#FF1744' : '#00FF88'}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-tighter">AI Logic Summary</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The core fraud risk is primarily driven by <span className="text-red-400 font-bold">Claim Amount</span> and <span className="text-red-400 font-bold">Urgency</span>.
                      The presence of <span className="text-green-400 font-bold">Witnesses</span> and <span className="text-green-400 font-bold">Historical Gap</span> are strong counter-indicators that significantly lowered the risk profile.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                      <p className="text-[10px] text-red-300 uppercase font-bold">Risk Factors</p>
                      <p className="text-sm font-bold">+0.75 Total</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                      <p className="text-[10px] text-green-300 uppercase font-bold">Safety Factors</p>
                      <p className="text-sm font-bold">-0.30 Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Document Consistency Check */}
          <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <ShieldAlert className="w-5 h-5 text-blue-400" />
                    <span>Cross-Document Consistency</span>
                  </CardTitle>
                  <CardDescription>Deep fraud detection via multi-document validation</CardDescription>
                </div>
                <Button
                  size="sm"
                  disabled={performingCrossCheck}
                  onClick={() => {
                    setPerformingCrossCheck(true);
                    setTimeout(() => {
                      setCrossCheckResult({
                        is_consistent: false,
                        risk_level: "HIGH",
                        conflicts: [
                          { type: "DATE_MISMATCH", message: "Incident date in Accident Photo (Oct 12) differs from Medical Bill (Oct 14)." }
                        ],
                        summary: "Inconsistencies detected across 3 uploaded documents."
                      });
                      setPerformingCrossCheck(false);
                      toast.warning("Cross-document inconsistencies detected!");
                    }, 2000);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {performingCrossCheck ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                  Run Batch Verify
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!crossCheckResult ? (
                <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                  <Activity className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="text-sm">Select multiple documents to run consistency scan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${crossCheckResult.is_consistent ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider">System Summary</span>
                      <Badge className={crossCheckResult.is_consistent ? 'bg-green-500' : 'bg-red-500'}>
                        {crossCheckResult.risk_level} RISK
                      </Badge>
                    </div>
                    <p className="text-sm">{crossCheckResult.summary}</p>
                  </div>

                  {crossCheckResult.conflicts.map((conflict: any, i: number) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-400 uppercase">{conflict.type}</p>
                        <p className="text-sm text-muted-foreground">{conflict.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Weather Forensics Validator */}
          <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl overflow-hidden mt-6">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <CloudRain className="w-5 h-5 text-cyan-400" />
                    <span>Geo-Spatial Weather Forensics</span>
                  </CardTitle>
                  <CardDescription>Validate claim context against historical weather data</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={checkingWeather}
                  onClick={async () => {
                    setCheckingWeather(true);
                    try {
                      // Simulating a check for a specific claim context
                      const response = await apiClient.post(API_CONFIG.ENDPOINTS.FORENSICS.WEATHER, {
                        location: "Mumbai, India",
                        incident_date: new Date().toISOString(),
                        claimed_condition: "Heavy Rain"
                      });
                      setWeatherForensics(response);
                      toast.success(response.is_consistent ? "Weather Verified Valid" : "Weather Discrepancy Found");
                    } catch (error) {
                      toast.error("Forensic check failed");
                    } finally {
                      setCheckingWeather(false);
                    }
                  }}
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  {checkingWeather ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                  Verify "Rain" Claim
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!weatherForensics ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Run forensic analysis to validate environmental claims
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${weatherForensics.is_consistent ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Verdict</span>
                      <Badge variant={weatherForensics.is_consistent ? "default" : "destructive"}>
                        {weatherForensics.is_consistent ? "CONSISTENT" : "FRAUD RISK"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{weatherForensics.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="block text-muted-foreground">Historical Temp</span>
                      <span className="font-mono text-lg">{weatherForensics.details.temperature}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="block text-muted-foreground">Precipitation</span>
                      <span className="font-mono text-lg">{weatherForensics.details.precipitation}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="block text-muted-foreground">Claimed</span>
                      <span className="font-bold text-cyan-300">{weatherForensics.details.claimed_condition}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <span className="block text-muted-foreground">Actual</span>
                      <span className="font-bold text-yellow-300">{weatherForensics.details.historical_actual}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-6"
        >
          {/* 3D Damage Visualizer (New v4.0) */}
          <DamageMapper />

          {/* Voice-Print Fraud Detection (New v4.0) */}
          <VoiceAnalyzer />

          <Card className="h-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#00FF88]" />
                <span>Neural Activity Stream</span>
                <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse ml-auto" />
              </CardTitle>
              <CardDescription>Live processing events</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {!loading && stats?.recent_activity ? (
                  stats.recent_activity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-2xl backdrop-blur-md border ${getActivityBg(activity.type)} hover:scale-[1.02] cursor-pointer transition-transform duration-300`}
                      onClick={() => {
                        // In a real app, this would fetch the claim's XAI data
                        // For demo, we'll randomize it slightly or use a map
                        const mockXAI = [
                          { feature: 'Amount', score: Math.random() > 0.5 ? 0.6 : 0.2, impact: 'POSITIVE' },
                          { feature: 'Witness', score: Math.random() > 0.5 ? -0.4 : 0.1, impact: 'NEGATIVE' },
                          { feature: 'History', score: 0.1, impact: 'POSITIVE' },
                          { feature: 'Speed', score: 0.3, impact: 'POSITIVE' },
                        ];
                        setSelectedXAI(mockXAI);
                        toast.info(`Analyzing AI Reasoning for claim #${activity.claim_id}`);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/10 rounded-xl">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <span className="font-bold text-sm block">#{activity.claim_id}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge className={`${getActivityBg(activity.type)} border-none py-0.5 text-[10px] uppercase font-bold`}>
                          {activity.type}
                        </Badge>
                        <span className="font-mono text-sm font-bold">{activity.amount}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/10"></div>
                    ))}
                  </div>
                )}

                <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center group overflow-hidden relative">
                  <span className="relative z-10 flex items-center">
                    Audit Archive
                    <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Process New Claim', icon: <FileText className="w-5 h-5" />, color: 'from-[#0066FF] to-[#06B6D4]', targetPage: 'documents' },
                { label: 'Run AI Analysis', icon: <Brain className="w-5 h-5" />, color: 'from-[#8B5CF6] to-[#06B6D4]', targetPage: 'workflows' },
                { label: 'View Reports', icon: <BarChart3 className="w-5 h-5" />, color: 'from-[#00FF88] to-[#00D4AA]', targetPage: 'dashboard' },
                { label: 'Settings', icon: <Settings className="w-5 h-5" />, color: 'from-[#FF6B35] to-[#FF1744]', targetPage: 'settings' }
              ].map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => onNavigate?.(action.targetPage)}
                    className={`w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 bg-gradient-to-br ${action.color} text-white border-none rounded-lg hover:opacity-90 transition-all`}
                  >
                    {action.icon}
                    <span className="text-xs sm:text-sm text-center leading-tight">{action.label}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
