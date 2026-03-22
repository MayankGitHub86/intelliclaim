import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { useTheme } from './theme-provider';
import {
  Brain,
  FileText,
  Workflow,
  Eye,
  Settings,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Activity,
  Menu,
  X,
  Trophy,
  TestTube,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onBackToLanding: () => void;
  onLogout?: () => void;
  isTrialUser?: boolean;
  onUpgrade?: () => void;
}

export function Navigation({ currentPage, onPageChange, onBackToLanding, onLogout, isTrialUser, onUpgrade }: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock recent analysis data - in real app this would come from props or context
  const recentAnalysis = [
    { id: 1, type: 'Car Damage', status: 'approved', amount: '₹2,50,000', time: '2 mins ago' },
    { id: 2, type: 'Medical Bill', status: 'under_review', amount: '₹1,80,000', time: '5 mins ago' },
    { id: 3, type: 'Water Damage', status: 'approved', amount: '₹4,20,000', time: '12 mins ago' }
  ];

  const todaysStats = {
    processed: 47,
    approved: 34,
    pending: 8,
    rejected: 5
  };

  const navItems = [
    {
      id: 'documents',
      label: 'Smart Prediction',
      icon: <Brain className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />,
      badge: '3'
    },
    {
      id: 'dashboard',
      label: 'Analytics',
      icon: <Activity className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />,
      badge: null
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <Workflow className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />,
      badge: null
    },
    {
      id: 'vision',
      label: 'Vision',
      icon: <Eye className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />,
      badge: 'NEW'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />,
      badge: null
    }
  ];

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const NavigationContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? 'h-full' : 'min-h-screen'} bg-gradient-to-b from-background to-background/95 backdrop-blur-sm flex flex-col`}>
      {/* Logo */}
      <motion.div
        className={`${isCollapsed && !isMobile ? 'p-4' : 'p-6'} border-b border-border/50 flex items-center justify-between`}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
          onPageChange('dashboard');
          if (isMobile) setIsMobileMenuOpen(false);
        }}>
          <div className={`${isCollapsed && !isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] rounded-xl flex items-center justify-center`}>
            <Brain className={`${isCollapsed && !isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">
                IntelliClaim
              </h2>
              <p className="text-xs text-muted-foreground">
                {isTrialUser ? 'Free Trial Active' : 'AI Insurance Platform'}
              </p>
            </div>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </motion.div>

      {/* Status & Trial Banner */}
      {(!isCollapsed || isMobile) && (
        <div className="px-6 py-4 space-y-3">
          {isTrialUser && (
            <motion.div
              className="p-3 bg-gradient-to-r from-[#FF6B35]/10 to-[#FF1744]/10 border border-[#FF6B35]/20 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-sm font-medium">Free Trial</span>
              </div>
              <button
                onClick={() => {
                  onUpgrade?.();
                  if (isMobile) setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#FF6B35] to-[#FF1744] hover:from-[#E55A2B] hover:to-[#DC143C] text-white rounded-lg transition-all duration-200"
              >
                Upgrade Now
              </button>
            </motion.div>
          )}

          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#00FF88]/10 to-[#00D4AA]/10 border border-[#00FF88]/20 rounded-lg">
            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
            <span className="text-sm font-medium">AI Systems Active</span>
            <Activity className="w-4 h-4 text-[#00FF88] ml-auto" />
          </div>
        </div>
      )}

      {/* Collapsed Status */}
      {isCollapsed && !isMobile && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-center p-2 bg-gradient-to-r from-[#00FF88]/10 to-[#00D4AA]/10 border border-[#00FF88]/20 rounded-lg">
            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-6 py-4 space-y-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handlePageChange(item.id)}
            className={`w-full flex items-center ${isCollapsed && !isMobile ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'} rounded-xl text-left transition-all duration-200 ${currentPage === item.id
              ? 'bg-gradient-to-r from-[#0066FF]/10 to-[#8B5CF6]/10 border border-[#0066FF]/20 text-[#0066FF] dark:text-[#06B6D4]'
              : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
              }`}
            whileHover={{ x: isCollapsed && !isMobile ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed && !isMobile ? item.label : undefined}
          >
            <span className={currentPage === item.id ? 'text-[#0066FF] dark:text-[#06B6D4]' : ''}>
              {item.icon}
            </span>
            {(!isCollapsed || isMobile) && (
              <>
                <span className="font-medium flex-1 text-sm">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badge === 'NEW' ? 'default' : 'secondary'}
                    className={
                      item.badge === 'NEW'
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white px-2 py-1 text-xs'
                        : 'bg-muted text-muted-foreground px-2 py-1 text-xs'
                    }
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Today's Stats Section */}
        {(!isCollapsed || isMobile) && (
          <div className="px-6 py-4 border-t border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Today's Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-[#00FF88]/10 to-[#00D4AA]/10 border border-[#00FF88]/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Processed</p>
                    <p className="text-sm font-semibold text-foreground">{todaysStats.processed}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#0066FF]/10 to-[#8B5CF6]/10 border border-[#0066FF]/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#0066FF]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="text-sm font-semibold text-green-600">{todaysStats.approved}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#FF9500]/10 to-[#FFD700]/10 border border-[#FF9500]/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#FF9500]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-sm font-semibold text-yellow-600">{todaysStats.pending}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#FF6B35]/10 to-[#FF1744]/10 border border-[#FF6B35]/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#FF6B35]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                    <p className="text-sm font-semibold text-red-600">{todaysStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Analysis Section */}
        {(!isCollapsed || isMobile) && (
          <div className="px-6 py-4 border-t border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Analysis
            </h3>
            <div className="space-y-2">
              {recentAnalysis.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  className="p-3 bg-gradient-to-r from-background to-background/95 border border-border/50 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground truncate">
                      {analysis.type}
                    </span>
                    {analysis.status === 'approved' && <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />}
                    {analysis.status === 'under_review' && <Clock className="w-3 h-3 text-yellow-600 flex-shrink-0" />}
                    {analysis.status === 'rejected' && <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0066FF]">{analysis.amount}</span>
                    <span className="text-xs text-muted-foreground">{analysis.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant */}
        {(!isCollapsed || isMobile) && (
          <div className="px-6 py-4">
            <motion.div
              className="p-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 border border-[#8B5CF6]/20 rounded-xl cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <p className="text-xs text-muted-foreground">Ask me anything about your claims</p>
            </motion.div>
          </div>
        )}
      </div>



      {/* Controls */}
      {(!isCollapsed || isMobile) && (
        <div className="p-6 border-t border-border/50 space-y-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-start px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            onClick={() => {
              (onLogout || onBackToLanding)();
              if (isMobile) setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-start px-3 py-2 text-sm rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isTrialUser ? 'Exit Trial' : 'Sign Out'}
          </button>
        </div>
      )}

      {/* Collapsed Controls */}
      {isCollapsed && !isMobile && (
        <div className="p-4 border-t border-border/50 space-y-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              (onLogout || onBackToLanding)();
            }}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
            title={isTrialUser ? 'Exit Trial' : 'Sign Out'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gradient-to-r from-background to-background/95 border-b border-border/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">
            IntelliClaim
          </h2>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                className="absolute left-0 top-0 w-80 bg-background border-r border-border/50 z-50 lg:hidden min-h-full"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <NavigationContent isMobile={true} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden lg:flex ${isCollapsed ? 'w-16' : 'w-72'} min-h-screen bg-gradient-to-b from-background to-background/95 border-r border-border/50 backdrop-blur-sm flex-col transition-all duration-300 flex-shrink-0`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: isCollapsed ? 64 : 288 }}
        transition={{ duration: 0.6 }}
      >
        <NavigationContent />
      </motion.aside>
    </>
  );
}
