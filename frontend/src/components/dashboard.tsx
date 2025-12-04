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
  RefreshCw
} from 'lucide-react';

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
}

export function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_claims: 0,
    processed_claims: 0,
    pending_claims: 0,
    accuracy_rate: 0,
    avg_processing_time: 0,
    cost_savings: 0
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
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
            whileHover={{ y: -4 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center text-white`}>
                    {metric.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl sm:text-3xl font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                </div>
              </CardContent>
              
              {/* Animated glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 -z-10`} />
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
          <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>AI Processing Overview</span>
              </CardTitle>
              <CardDescription>Real-time claim processing analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-[#8B5CF6]/10 to-[#06B6D4]/10 rounded-lg overflow-hidden">
                  {/* Simplified background pattern instead of heavy image */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 25% 25%, #8B5CF6 2px, transparent 2px), radial-gradient(circle at 75% 75%, #06B6D4 1px, transparent 1px)',
                      backgroundSize: '40px 40px, 20px 20px'
                    }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20" />
                  
                  {/* Static Stats */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-sm font-medium">Neural Processing</span>
                    </div>
                    <p className="text-lg font-bold">{metrics.accuracy_rate}%</p>
                  </div>
                  
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#00FF88]" />
                      <span className="text-sm font-medium">Speed</span>
                    </div>
                    <p className="text-lg font-bold">{metrics.avg_processing_time}s</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Claims Processed</span>
                      <span className="text-sm text-muted-foreground">{Math.round((metrics.processed_claims / (metrics.total_claims || 1)) * 100)}%</span>
                    </div>
                    <Progress value={(metrics.processed_claims / (metrics.total_claims || 1)) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">AI Confidence</span>
                      <span className="text-sm text-muted-foreground">{metrics.accuracy_rate}%</span>
                    </div>
                    <Progress value={metrics.accuracy_rate} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="h-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Live Activity</span>
                <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse ml-auto" />
              </CardTitle>
              <CardDescription>Real-time claim processing updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!loading && stats?.recent_activity ? (
                  stats.recent_activity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-3 border rounded-lg ${getActivityBg(activity.type)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type)}
                          <span className="font-medium text-sm">Claim {activity.claim_id}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">{activity.type}</span>
                        <span className="font-medium text-sm">{activity.amount}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg bg-muted/20 animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button className="w-full py-2 px-4 border rounded-lg text-sm hover:bg-muted/50 transition-colors flex items-center justify-center">
                  View All Activities
                  <ArrowUpRight className="w-4 h-4 ml-2" />
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
                { label: 'Process New Claim', icon: <FileText className="w-5 h-5" />, color: 'from-[#0066FF] to-[#06B6D4]' },
                { label: 'Run AI Analysis', icon: <Brain className="w-5 h-5" />, color: 'from-[#8B5CF6] to-[#06B6D4]' },
                { label: 'View Reports', icon: <BarChart3 className="w-5 h-5" />, color: 'from-[#00FF88] to-[#00D4AA]' },
                { label: 'Settings', icon: <Settings className="w-5 h-5" />, color: 'from-[#FF6B35] to-[#FF1744]' }
              ].map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button 
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