import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from "sonner";
import { useTheme } from './theme-provider';
import { apiClient, API_CONFIG } from '../config/api';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Zap, 
  Database, 
  Download, 
  Upload, 
  HelpCircle, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  Key,
  Smartphone,
  Mail,
  Globe,
  Activity,
  BarChart3,
  Brain,
  Workflow,
  FileText,
  Camera,
  Lock,
  Trash2,
  RefreshCw,
  ExternalLink,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SettingsProps {
  isTrialUser?: boolean;
  onUpgrade?: () => void;
  userProfile?: {
    name: string;
    email: string;
    company: string;
    role: string;
    avatar?: string;
  } | null;
}

export function Settings({ isTrialUser = false, onUpgrade, userProfile }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    company: userProfile?.company || '',
    role: userProfile?.role || '',
    avatar: userProfile?.avatar || ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordLastChanged: '2024-01-15'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    claimUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    marketingEmails: false
  });

  const [aiSettings, setAiSettings] = useState({
    processingModel: 'advanced',
    confidenceThreshold: 85,
    autoApproval: false,
    dataRetention: '12',
    processingSpeed: 'balanced'
  });

  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-proj-*********************',
    rateLimitPerHour: 1000,
    webhookUrl: '',
    enableWebhooks: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(68);

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Ensure we have a valid authentication token
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          console.log('No auth token found, using fallback profile data');
          // Use the userProfile prop or fallback to default data
          if (userProfile) {
            setProfileData({
              name: userProfile.name || '',
              email: userProfile.email || '',
              company: userProfile.company || '',
              role: userProfile.role || '',
              avatar: userProfile.avatar || ''
            });
          } else {
            // Fallback to default trial user data
            setProfileData({
              name: 'Trial User',
              email: 'trial@intelliclaim.demo',
              company: 'IntelliClaim Trial',
              role: 'Claims Analyst',
              avatar: ''
            });
          }
          return;
        }
        
        // Set token for API client
        apiClient.setToken(authToken);
        
        // Load profile data (refresh from API to ensure it's current)
        try {
          const profile = await apiClient.get(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
          setProfileData({
            name: profile.name || '',
            email: profile.email || '',
            company: profile.company || '',
            role: profile.role || '',
            avatar: profile.avatar || ''
          });
        } catch (profileError) {
          console.log('Profile API not available, using prop data or fallback');
          // Use the userProfile data if API fails
          if (userProfile) {
            setProfileData({
              name: userProfile.name || '',
              email: userProfile.email || '',
              company: userProfile.company || '',
              role: userProfile.role || '',
              avatar: userProfile.avatar || ''
            });
          } else {
            // Fallback to default data
            setProfileData({
              name: 'Trial User',
              email: 'trial@intelliclaim.demo',
              company: 'IntelliClaim Trial',
              role: 'Claims Analyst',
              avatar: ''
            });
          }
        }
        
        // Load other settings
        try {
          const notifications = await apiClient.get(API_CONFIG.ENDPOINTS.SETTINGS.NOTIFICATIONS);
          setNotificationSettings(notifications || notificationSettings);
        } catch (error) {
          console.log('Notifications settings not available, using defaults');
        }
        
        try {
          const ai = await apiClient.get(API_CONFIG.ENDPOINTS.SETTINGS.AI);
          setAiSettings(ai || aiSettings);
        } catch (error) {
          console.log('AI settings not available, using defaults');
        }
        
      } catch (error: any) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
        
        // Use the userProfile data if API fails
        if (userProfile) {
          setProfileData({
            name: userProfile.name || '',
            email: userProfile.email || '',
            company: userProfile.company || '',
            role: userProfile.role || '',
            avatar: userProfile.avatar || ''
          });
        } else {
          // Fallback to default data
          setProfileData({
            name: 'Trial User',
            email: 'trial@intelliclaim.demo',
            company: 'IntelliClaim Trial',
            role: 'Claims Analyst',
            avatar: ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [userProfile]);

  // Save profile settings
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await apiClient.put(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, {
        name: profileData.name,
        company: profileData.company,
        role: profileData.role
      });
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Save preferences
  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);
      await apiClient.put(API_CONFIG.ENDPOINTS.SETTINGS.NOTIFICATIONS, notificationSettings);
      toast.success('Notification preferences updated!');
    } catch (error: any) {
      console.error('Failed to update notifications:', error);
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAISettings = async () => {
    try {
      setIsLoading(true);
      await apiClient.put(API_CONFIG.ENDPOINTS.SETTINGS.AI, aiSettings);
      toast.success('AI preferences updated!');
    } catch (error: any) {
      console.error('Failed to update AI settings:', error);
      toast.error('Failed to update AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Password changed successfully!');
    setSecuritySettings(prev => ({
      ...prev,
      passwordLastChanged: new Date().toISOString().split('T')[0]
    }));
    setIsLoading(false);
  };

  const handleResetApiKey = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setApiSettings(prev => ({
      ...prev,
      apiKey: 'sk-proj-' + Math.random().toString(36).substring(2, 23)
    }));
    toast.success('API key regenerated successfully!');
    setIsLoading(false);
  };

  const handleExportData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Data export initiated! You\'ll receive an email when ready.');
    setIsLoading(false);
  };

  const planDetails = {
    name: isTrialUser ? 'Free Trial' : 'Professional',
    price: isTrialUser ? '$0' : '$99',
    period: isTrialUser ? '14 days remaining' : 'per month',
    features: isTrialUser ? [
      '1,000 claims processed',
      'Basic AI models',
      'Email support',
      '30-day data retention'
    ] : [
      'Unlimited claims',
      'Advanced AI models',
      'Priority support',
      'Custom data retention',
      'API access',
      'Custom integrations'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/30">
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted-foreground">Manage your IntelliClaim preferences and configuration</p>
            </div>
          </div>
          
          {isTrialUser && (
            <motion.div
              className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-200 dark:border-orange-800 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    Free Trial - 7 days remaining
                  </span>
                </div>
                <Button 
                  onClick={onUpgrade}
                  className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED]"
                >
                  Upgrade Now
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 lg:w-fit gap-1 sm:gap-0 h-auto p-1">
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden text-xs">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden text-xs">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
              <span className="sm:hidden text-xs">AI</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="hidden sm:flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="hidden sm:flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="hidden sm:flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>Update your personal details and profile settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#8B5CF6] text-white text-xl">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={profileData.role} onValueChange={(value) => setProfileData({...profileData, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Claims Manager">Claims Manager</SelectItem>
                          <SelectItem value="Insurance Agent">Insurance Agent</SelectItem>
                          <SelectItem value="Adjuster">Adjuster</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Analyst">Analyst</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED]"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Theme Settings */}
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span>Appearance</span>
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your interface</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">Switch between light and dark modes</p>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security & Privacy</span>
                  </CardTitle>
                  <CardDescription>Manage your account security and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={securitySettings.twoFactor}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactor: checked})}
                        />
                        {securitySettings.twoFactor && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Check className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new sign-ins to your account</p>
                      </div>
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, loginAlerts: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">Automatically sign out after inactivity</p>
                      </div>
                      <Select 
                        value={securitySettings.sessionTimeout} 
                        onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Password</Label>
                        <p className="text-sm text-muted-foreground">
                          Last changed: {new Date(securitySettings.passwordLastChanged).toLocaleDateString()}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">Change Password</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Change Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Enter your current password and choose a new one.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="current">Current Password</Label>
                              <div className="relative">
                                <Input
                                  id="current"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter current password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new">New Password</Label>
                              <Input
                                id="new"
                                type="password"
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm">Confirm Password</Label>
                              <Input
                                id="confirm"
                                type="password"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleChangePassword}
                              className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED]"
                            >
                              Change Password
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>Email Notifications</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>Push Notifications</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Claim Updates</Label>
                        <p className="text-sm text-muted-foreground">Get notified when claim status changes</p>
                      </div>
                      <Switch
                        checked={notificationSettings.claimUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, claimUpdates: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Important system maintenance and updates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Weekly summary of your claims and analytics</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyReports}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Product updates and feature announcements</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketingEmails: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Processing Settings</span>
                  </CardTitle>
                  <CardDescription>Configure how AI models process your claims and documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Processing Model</Label>
                      <Select value={aiSettings.processingModel} onValueChange={(value) => setAiSettings({...aiSettings, processingModel: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Model - Faster processing</SelectItem>
                          <SelectItem value="advanced">Advanced Model - Higher accuracy</SelectItem>
                          <SelectItem value="premium">Premium Model - Best performance</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {aiSettings.processingModel === 'basic' && 'Optimized for speed with good accuracy'}
                        {aiSettings.processingModel === 'advanced' && 'Balanced speed and accuracy for most use cases'}
                        {aiSettings.processingModel === 'premium' && 'Highest accuracy with comprehensive analysis'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Confidence Threshold: {aiSettings.confidenceThreshold}%</Label>
                      <div className="px-3">
                        <input
                          type="range"
                          min="50"
                          max="99"
                          value={aiSettings.confidenceThreshold}
                          onChange={(e) => setAiSettings({...aiSettings, confidenceThreshold: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Claims below this confidence level will require manual review
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-approval</Label>
                        <p className="text-sm text-muted-foreground">Automatically approve high-confidence claims</p>
                      </div>
                      <Switch
                        checked={aiSettings.autoApproval}
                        onCheckedChange={(checked) => setAiSettings({...aiSettings, autoApproval: checked})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Processing Speed</Label>
                      <Select value={aiSettings.processingSpeed} onValueChange={(value) => setAiSettings({...aiSettings, processingSpeed: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">Fast - Lower resource usage</SelectItem>
                          <SelectItem value="balanced">Balanced - Optimal performance</SelectItem>
                          <SelectItem value="thorough">Thorough - Maximum accuracy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Retention Period</Label>
                      <Select value={aiSettings.dataRetention} onValueChange={(value) => setAiSettings({...aiSettings, dataRetention: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 month</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How long to keep processed claims data for learning and improvement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Subscription & Billing</span>
                  </CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{planDetails.name}</h3>
                        {isTrialUser && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            Trial
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{planDetails.price}<span className="text-sm text-muted-foreground">/{planDetails.period}</span></p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {planDetails.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="w-3 h-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      {isTrialUser ? (
                        <Button 
                          onClick={onUpgrade}
                          className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED]"
                        >
                          Upgrade Now
                        </Button>
                      ) : (
                        <Button variant="outline">Manage Subscription</Button>
                      )}
                      <Button variant="ghost" size="sm" className="w-full">
                        View Plans
                      </Button>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Usage</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Claims Processed</span>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-2xl font-bold">847</div>
                          <div className="text-xs text-muted-foreground">
                            {isTrialUser ? 'of 1,000' : 'Unlimited'}
                          </div>
                          {isTrialUser && (
                            <Progress value={84.7} className="mt-2" />
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">API Calls</span>
                            <Activity className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-2xl font-bold">12,453</div>
                          <div className="text-xs text-muted-foreground">This month</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Storage Used</span>
                            <Database className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-2xl font-bold">{storageUsed}%</div>
                          <div className="text-xs text-muted-foreground">of 100 GB</div>
                          <Progress value={storageUsed} className="mt-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {!isTrialUser && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Payment Method</h4>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>API Configuration</span>
                  </CardTitle>
                  <CardDescription>Manage your API keys and integration settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isTrialUser ? (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">API Access Not Available</h3>
                      <p className="text-muted-foreground mb-4">
                        API access is available on Professional and Enterprise plans.
                      </p>
                      <Button onClick={onUpgrade} className="bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:from-[#0052CC] hover:to-[#7C3AED]">
                        Upgrade to Access API
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex space-x-2">
                          <Input 
                            value={apiSettings.apiKey} 
                            readOnly 
                            type="password"
                            className="font-mono"
                          />
                          <Button 
                            variant="outline" 
                            onClick={handleResetApiKey}
                            disabled={isLoading}
                          >
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Keep your API key secure. Don't share it in publicly accessible areas.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Rate Limit</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            value={apiSettings.rateLimitPerHour} 
                            onChange={(e) => setApiSettings({...apiSettings, rateLimitPerHour: parseInt(e.target.value)})}
                            type="number"
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground">requests per hour</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Webhooks</Label>
                          <p className="text-sm text-muted-foreground">Receive real-time notifications via webhooks</p>
                        </div>
                        <Switch
                          checked={apiSettings.enableWebhooks}
                          onCheckedChange={(checked) => setApiSettings({...apiSettings, enableWebhooks: checked})}
                        />
                      </div>

                      {apiSettings.enableWebhooks && (
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input 
                            value={apiSettings.webhookUrl} 
                            onChange={(e) => setApiSettings({...apiSettings, webhookUrl: e.target.value})}
                            placeholder="https://your-domain.com/webhook"
                          />
                        </div>
                      )}

                      <div className="pt-4">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View API Documentation
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Data Management</span>
                  </CardTitle>
                  <CardDescription>Export, import, and manage your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-muted-foreground">Download all your claims data in JSON format</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleExportData}
                        disabled={isLoading}
                      >
                        {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Import Data</h4>
                        <p className="text-sm text-muted-foreground">Upload existing claims data from CSV or JSON</p>
                      </div>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Data Backup</h4>
                        <p className="text-sm text-muted-foreground">Create a complete backup of your account</p>
                      </div>
                      <Button variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        Backup
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      <h4 className="font-medium">Danger Zone</h4>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Delete Account</span>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all of your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}