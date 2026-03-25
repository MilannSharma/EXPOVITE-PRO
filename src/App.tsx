import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { scanVisitingCard } from './services/geminiService';
import { 
  Plus, 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Settings as SettingsIcon,
  ChevronRight,
  MapPin,
  Calendar,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Camera,
  Pencil,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Share2,
  Download,
  Clock,
  Zap,
  ArrowRight,
  Phone,
  MessageSquare,
  WifiOff,
  Cloud,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAppData } from './useAppData';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { cn } from './lib/utils';
import { Expo, Lead, Priority, DISTRICTS, DISTRICT_STATE_MAP, INTEREST_CATEGORIES } from './types';

// --- Components ---

const BottomNav = ({ activeTab, onTabChange, expoContext = false }: { activeTab: string, onTabChange: (tab: string) => void, expoContext?: boolean }) => {
  const tabs = expoContext 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'new-lead', label: 'New Lead', icon: UserPlus },
        { id: 'all-leads', label: 'All Leads', icon: Users },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
      ]
    : [
        { id: 'home', label: 'Expos', icon: LayoutDashboard },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/5 flex items-center justify-around px-4 pb-4 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === tab.id ? "text-[#7c6cf0]" : "text-[#5a5675]"
          )}
        >
          <tab.icon size={24} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const ScreenWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.28, ease: "easeOut" }}
    className={cn("min-h-screen pb-24 pt-6 px-4 max-w-[420px] mx-auto", className)}
  >
    {children}
  </motion.div>
);

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    Hot: "bg-[#f87171] text-white",
    Warm: "bg-[#fbbf24] text-black",
    Cold: "bg-[#60a5fa] text-white"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", colors[priority])}>
      {priority}
    </span>
  );
};

// --- Screens ---

const ExpoSelection: React.FC<{ onSelectExpo: (expo: Expo) => void, onOpenSettings: () => void, onAddExpo: () => void, data: any }> = ({ onSelectExpo, onOpenSettings, onAddExpo, data }) => {
  const activeExpos = data.expos.filter((e: Expo) => e.status === 'active');
  const upcomingExpos = data.expos.filter((e: Expo) => e.status === 'upcoming');
  const pastExpos = data.expos.filter((e: Expo) => e.status === 'ended');

  return (
    <ScreenWrapper>
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">ExpoVite</h1>
        <Avatar className="w-10 h-10 cursor-pointer border border-white/10" onClick={onOpenSettings}>
          <AvatarFallback>{data.agent.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </header>

      {activeExpos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-[#5a5675] uppercase tracking-widest mb-4">Live Now</h2>
          {activeExpos.map((expo: Expo) => (
            <Card key={expo.id} className="glow-purple border-[#7c6cf0]/30 overflow-hidden cursor-pointer" onClick={() => onSelectExpo(expo)}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse-green" />
                  <span className="text-[10px] font-bold text-[#34d399] uppercase tracking-widest">Live</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{expo.name}</h3>
                <div className="flex items-center gap-4 text-sm text-[#9994b8]">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {expo.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(expo.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#5a5675]">Today's Leads</span>
                  <span className="text-lg font-mono font-bold text-[#7c6cf0]">{expo.leads.length}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {upcomingExpos.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#5a5675] uppercase tracking-widest mb-4">Upcoming</h2>
            <div className="space-y-3">
              {upcomingExpos.map((expo: Expo) => (
                <Card key={expo.id} className="cursor-pointer hover:border-white/20 transition-colors" onClick={() => onSelectExpo(expo)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{expo.name}</h4>
                      <p className="text-xs text-[#9994b8]">{expo.location} · {new Date(expo.startDate).toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-white/5 text-[10px] font-bold text-[#9994b8] uppercase tracking-wider">Upcoming</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pastExpos.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#5a5675] uppercase tracking-widest mb-4">Past</h2>
            <div className="space-y-3">
              {pastExpos.map((expo: Expo) => (
                <Card key={expo.id} className="cursor-pointer opacity-70 hover:opacity-100 transition-all" onClick={() => onSelectExpo(expo)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{expo.name}</h4>
                      <p className="text-xs text-[#9994b8]">{expo.leads.length} leads captured</p>
                    </div>
                    <ChevronRight size={16} className="text-[#5a5675]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none">
        <Button 
          onClick={onAddExpo}
          className="rounded-full h-14 px-8 pointer-events-auto shadow-2xl"
        >
          <Plus className="mr-2" size={20} />
          Create New Expo
        </Button>
      </div>
    </ScreenWrapper>
  );
};

// --- Main App ---

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-[#fbbf24] text-[#0a0a0f] py-2 px-4 text-center text-[10px] font-bold uppercase tracking-widest z-[200] flex items-center justify-center gap-2">
      <WifiOff size={12} />
      Offline Mode — Leads will sync when back online
    </div>
  );
};

export default function App() {
  const { data, addExpo, addLead, updateLead, updateAgentName, updateSettings } = useAppData();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedExpo, setSelectedExpo] = useState<Expo | null>(null);
  const [showNewExpoModal, setShowNewExpoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [lastSavedLead, setLastSavedLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'self') {
      const activeExpo = data.expos.find(e => e.status === 'active');
      if (activeExpo) {
        setSelectedExpo(activeExpo);
        setCurrentScreen('manual-entry');
      }
    }
  }, [data.expos]);

  const handleSelectExpo = (expo: Expo) => {
    setSelectedExpo(expo);
    setCurrentScreen('expo-dashboard');
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
      setSelectedExpo(null);
    } else if (tab === 'settings') {
      setCurrentScreen('settings');
    } else if (tab === 'dashboard' && selectedExpo) {
      setCurrentScreen('expo-dashboard');
    } else if (tab === 'new-lead' && selectedExpo) {
      setCurrentScreen('new-lead-selection');
    } else if (tab === 'all-leads' && selectedExpo) {
      setCurrentScreen('leads-list');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0eff8] selection:bg-[#7c6cf0]/30">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <ExpoSelection 
            key="home"
            data={data}
            onSelectExpo={handleSelectExpo}
            onOpenSettings={() => handleTabChange('settings')}
            onAddExpo={() => setShowNewExpoModal(true)}
          />
        )}
        
        {/* Placeholder for other screens - will implement in next turns */}
        {currentScreen === 'expo-dashboard' && selectedExpo && (
          <ScreenWrapper key="dashboard">
            <OfflineBanner />
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => handleTabChange('home')} className="p-2 -ml-2 text-[#9994b8]"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold truncate max-w-[200px]">{selectedExpo.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                {selectedExpo.status === 'ended' && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Ended</span>}
                <div className="w-8 h-8 rounded-full bg-[#7c6cf0]/10 border border-[#7c6cf0]/20 flex items-center justify-center text-[#7c6cf0] text-xs font-bold">EV</div>
              </div>
            </header>

            {selectedExpo.status === 'ended' && (
              <div className="mb-6 p-3 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center gap-3">
                <AlertCircle size={18} className="text-[#fbbf24]" />
                <p className="text-xs text-[#fbbf24] font-medium">This expo has ended · Viewing archived data</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-[#7c6cf0]/5 border-[#7c6cf0]/20">
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest mb-1">Total Leads</p>
                  <h3 className="text-3xl font-bold font-mono">{selectedExpo.leads.length}</h3>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest mb-1">Today's Leads</p>
                  <h3 className="text-3xl font-bold font-mono">
                    {selectedExpo.leads.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
                  </h3>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 mb-24">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Activity (Hourly)</h3>
                <Card>
                  <CardContent className="p-4 h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Array.from({ length: 12 }, (_, i) => {
                        const hour = i + 9;
                        const count = selectedExpo.leads.filter(l => new Date(l.timestamp).getHours() === hour).length;
                        return { hour: `${hour}:00`, count };
                      })}>
                        <XAxis dataKey="hour" hide />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#7c6cf0', fontSize: '12px' }}
                        />
                        <Bar dataKey="count" fill="#7c6cf0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Recent Leads</h3>
                  <button onClick={() => setCurrentScreen('leads-list')} className="text-[10px] font-bold text-[#7c6cf0] uppercase tracking-widest">View All</button>
                </div>
                <div className="space-y-3">
                  {selectedExpo.leads.slice(0, 3).map((lead: Lead, i: number) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="cursor-pointer active:scale-[0.98] transition-all" onClick={() => {
                        setSelectedLead(lead);
                        setCurrentScreen('lead-detail');
                      }}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold">{lead.name}</h4>
                            <p className="text-[10px] text-[#9994b8]">{lead.firmName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <PriorityBadge priority={lead.priority} />
                            <ChevronRight size={16} className="text-[#5a5675]" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {selectedExpo.leads.length === 0 && (
                    <div className="text-center py-8 text-[#5a5675] text-xs">No leads captured yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-6">
              <Button onClick={() => setCurrentScreen('new-lead-selection')} className="w-full h-14 shadow-[0_8px_32px_rgba(124,108,240,0.3)]">
                <Plus size={20} className="mr-2" />
                Capture New Lead
              </Button>
            </div>
          </ScreenWrapper>
        )}

        {currentScreen === 'new-lead-selection' && (
          <NewLeadSelection 
            onSelectManual={() => setCurrentScreen('manual-entry')}
            onSelectHybrid={() => setCurrentScreen('hybrid-entry')}
            onCancel={() => setCurrentScreen('expo-dashboard')}
          />
        )}

        {currentScreen === 'manual-entry' && (
          <ManualEntryForm 
            onCancel={() => {
              if (selectedLead) {
                setCurrentScreen('lead-detail');
              } else {
                setCurrentScreen('new-lead-selection');
              }
            }} 
            onSave={(lead) => {
              if (selectedLead) {
                updateLead(selectedExpo!.id, selectedLead.id, lead);
                setSelectedLead(lead); // Update selected lead to show updated details
              } else {
                addLead(selectedExpo!.id, lead);
              }
              setLastSavedLead(lead);
              setCurrentScreen('success');
            }}
            expo={selectedExpo!}
            agentName={data.agent.name}
            allLeads={data.expos.flatMap(e => e.leads)}
            initialLeadData={selectedLead || undefined}
          />
        )}

        {currentScreen === 'hybrid-entry' && (
          <HybridEntryFlow 
            onCancel={() => setCurrentScreen('new-lead-selection')} 
            onSave={(lead) => {
              addLead(selectedExpo!.id, lead);
              setLastSavedLead(lead);
              setCurrentScreen('success');
            }}
            expo={selectedExpo!}
            agentName={data.agent.name}
            allLeads={data.expos.flatMap(e => e.leads)}
          />
        )}

        {currentScreen === 'success' && lastSavedLead && (
          <SuccessScreen 
            lead={lastSavedLead} 
            expoName={selectedExpo?.name || ''}
            onAddAnother={() => setCurrentScreen('new-lead-selection')}
            onViewAll={() => handleTabChange('all-leads')}
          />
        )}

        {currentScreen === 'leads-list' && selectedExpo && (
          <LeadsList 
            expo={selectedExpo} 
            onSelectLead={(lead) => {
              setSelectedLead(lead);
              setCurrentScreen('lead-detail');
            }}
            onBack={() => setCurrentScreen('expo-dashboard')}
          />
        )}

        {currentScreen === 'lead-detail' && selectedLead && (
          <LeadDetail 
            lead={selectedLead} 
            expoName={selectedExpo?.name || ''}
            onBack={() => {
              setSelectedLead(null);
              setCurrentScreen('leads-list');
            }}
            onEdit={() => setCurrentScreen('manual-entry')}
          />
        )}

        {currentScreen === 'settings' && (
          <ScreenWrapper key="settings">
            <header className="mb-8">
              <h1 className="text-2xl font-bold">Settings</h1>
            </header>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <Avatar className="w-12 h-12 border border-white/10">
                     <AvatarFallback>{data.agent.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                     <h3 className="font-bold">{data.agent.name}</h3>
                     <p className="text-xs text-[#9994b8]">Agent ID: {data.agent.id}</p>
                   </div>
                   <Button variant="ghost" size="sm" className="text-[#7c6cf0]">Edit</Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Preferences</h3>
                <Card>
                  <CardContent className="p-0 divide-y divide-white/5">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">WhatsApp Greeting</p>
                        <p className="text-[10px] text-[#5a5675]">Send automatic message to new leads</p>
                      </div>
                      <div className="w-10 h-6 rounded-full bg-[#7c6cf0] relative">
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Follow-up Reminders</p>
                        <p className="text-[10px] text-[#5a5675]">Notify for hot leads after 24h</p>
                      </div>
                      <div className="w-10 h-6 rounded-full bg-white/10 relative">
                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Data Management</h3>
                <Card>
                  <CardContent className="p-0 divide-y divide-white/5">
                    <button className="w-full p-4 flex items-center justify-between text-left active:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Download size={18} className="text-[#9994b8]" />
                        <span className="text-sm font-medium">Export All Leads (CSV)</span>
                      </div>
                      <ChevronRight size={16} className="text-[#5a5675]" />
                    </button>
                    <button className="w-full p-4 flex items-center justify-between text-left active:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Cloud size={18} className="text-[#9994b8]" />
                        <span className="text-sm font-medium">Force Sync Data</span>
                      </div>
                      <ChevronRight size={16} className="text-[#5a5675]" />
                    </button>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-8 text-center">
                <p className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest mb-2">ExpoVite Lead Manager</p>
                <p className="text-[10px] text-[#5a5675]">Version 2.4.0 · Powered by ExpoVite</p>
              </div>
            </div>
          </ScreenWrapper>
        )}
      </AnimatePresence>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        expoContext={!!selectedExpo} 
      />

      {/* New Expo Modal */}
      <AnimatePresence>
        {showNewExpoModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewExpoModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 glass rounded-t-[32px] p-8 z-[70] max-w-[420px] mx-auto border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <h2 className="text-2xl font-bold mb-6">Create New Expo</h2>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newExpo: Expo = {
                  id: `expo_${Date.now()}`,
                  name: formData.get('name') as string,
                  location: formData.get('location') as string,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                  followUpDate: formData.get('endDate') as string, // Simplified
                  status: 'active',
                  leads: []
                };
                addExpo(newExpo);
                setShowNewExpoModal(false);
                handleSelectExpo(newExpo);
              }}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Expo Name *</label>
                  <input name="name" required className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0] transition-colors" placeholder="e.g. Media Expo 2025" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Location *</label>
                  <input name="location" required className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0] transition-colors" placeholder="e.g. Jaipur" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Start Date *</label>
                    <input name="startDate" type="date" required className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0] transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">End Date *</label>
                    <input name="endDate" type="date" required className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0] transition-colors" />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4 h-14 text-lg">Create Expo</Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Camera Component ---

const CameraCapture = ({ onCapture, onCancel }: { onCapture: (base64: string) => void, onCancel: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };
    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-8">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="mb-6">{error}</p>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/40 rounded-2xl relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/30 animate-pulse" />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="h-32 bg-black flex items-center justify-around px-8">
        <button onClick={onCancel} className="text-white/60 font-bold uppercase tracking-widest text-xs">Cancel</button>
        <button 
          onClick={capture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>
        <div className="w-12" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// --- Form Components ---

const NewLeadSelection = ({ onSelectManual, onSelectHybrid, onCancel }: { onSelectManual: () => void, onSelectHybrid: () => void, onCancel: () => void }) => {
  return (
    <ScreenWrapper>
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 -ml-2 text-[#9994b8]"><ArrowLeft size={24} /></button>
        <h1 className="text-2xl font-bold">New Lead</h1>
      </header>
      <p className="text-sm text-[#9994b8] mb-8">How would you like to capture this lead?</p>
      
      <div className="space-y-4">
        <button 
          onClick={onSelectManual}
          className="w-full p-6 glass border border-white/10 rounded-[20px] flex items-center gap-6 text-left active:border-[#7c6cf0] active:shadow-[0_0_20px_rgba(124,108,240,0.2)] transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#7c6cf0] group-active:scale-95 transition-transform">
            <Pencil size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Manual Entry</h3>
            <p className="text-xs text-[#5a5675] leading-relaxed">Fill all details by typing. Best when visitor is in front of you.</p>
          </div>
          <ChevronRight size={20} className="text-[#5a5675]" />
        </button>

        <button 
          onClick={onSelectHybrid}
          className="w-full p-6 glass border border-white/10 rounded-[20px] flex items-center gap-6 text-left active:border-[#7c6cf0] active:shadow-[0_0_20px_rgba(124,108,240,0.2)] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#7c6cf0] text-[8px] font-bold text-white uppercase tracking-widest">Recommended</div>
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#7c6cf0] group-active:scale-95 transition-transform">
            <Camera size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Scan Visiting Card</h3>
            <p className="text-xs text-[#5a5675] leading-relaxed">Photograph visiting card. Name, mobile, address auto-filled. You add the rest.</p>
          </div>
          <ChevronRight size={20} className="text-[#5a5675]" />
        </button>
      </div>
    </ScreenWrapper>
  );
};

const ManualEntryForm = ({ onCancel, onSave, expo, agentName, allLeads, initialLeadData }: { onCancel: () => void, onSave: (lead: Lead) => void, expo: Expo, agentName: string, allLeads: Lead[], initialLeadData?: Lead }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Lead>>(initialLeadData || {
    priority: 'Warm',
    interests: [],
    agentName,
    expoId: expo.id,
    entryMethod: 'manual',
    synced: false,
    timestamp: new Date().toISOString()
  });
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Lead | null>(null);

  const handleMobileBlur = (mobile: string) => {
    if (mobile.length === 10) {
      // Don't show duplicate warning if we are editing the same lead
      const duplicate = allLeads.find(l => l.mobile === mobile && l.id !== initialLeadData?.id);
      if (duplicate) setDuplicateWarning(duplicate);
      else setDuplicateWarning(null);
    }
  };

  const isStep1Valid = formData.name && formData.mobile?.length === 10 && formData.firmName && formData.priority;
  const isStep2Valid = !!formData.district;

  const [districtSearch, setDistrictSearch] = useState(initialLeadData?.district || '');
  const [showDistrictList, setShowDistrictList] = useState(false);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch) return [];
    return DISTRICTS.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase())).slice(0, 5);
  }, [districtSearch]);

  const handleSave = () => {
    if (!isStep2Valid || isSaving) return;
    setIsSaving(true);
    setTimeout(() => {
      onSave({...formData, id: initialLeadData?.id || `lead_${Date.now()}`} as Lead);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <header className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="p-2 -ml-2 text-[#9994b8]"><X size={24} /></button>
        <div className="flex gap-2">
          {[1, 2].map(s => (
            <div key={s} className={cn("w-8 h-1.5 rounded-full transition-colors", step >= s ? "bg-[#7c6cf0]" : "bg-white/10")} />
          ))}
        </div>
        <div className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Basic Info</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Name *</label>
                <input 
                  autoFocus
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && isStep1Valid && setStep(2)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0]" 
                  placeholder="Full Name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Mobile Number *</label>
                <input 
                  type="tel"
                  maxLength={10}
                  value={formData.mobile || ''} 
                  onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                  onBlur={e => handleMobileBlur(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && isStep1Valid && setStep(2)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 font-mono focus:outline-none focus:border-[#7c6cf0]" 
                  placeholder="10-digit mobile" 
                />
                {duplicateWarning && (
                  <div className="p-3 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#fbbf24] text-xs font-medium">
                      <AlertCircle size={14} />
                      Already captured — {duplicateWarning.name} from {duplicateWarning.firmName} on {new Date(duplicateWarning.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex gap-4">
                      <button className="text-[10px] text-[#fbbf24] underline text-left font-bold uppercase tracking-widest">View Lead ↗</button>
                      <button onClick={() => setDuplicateWarning(null)} className="text-[10px] text-[#fbbf24] underline text-left font-bold uppercase tracking-widest">Continue Anyway</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Firm Name *</label>
                <input 
                  value={formData.firmName || ''} 
                  onChange={e => setFormData({...formData, firmName: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && isStep1Valid && setStep(2)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0]" 
                  placeholder="Company Name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Priority *</label>
                <div className="flex gap-2">
                  {(['Hot', 'Warm', 'Cold'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setFormData({...formData, priority: p})}
                      className={cn(
                        "flex-1 h-12 rounded-[12px] text-xs font-bold uppercase tracking-widest transition-all",
                        formData.priority === p 
                          ? p === 'Hot' ? "bg-[#f87171] text-white" : p === 'Warm' ? "bg-[#fbbf24] text-black" : "bg-[#60a5fa] text-white"
                          : "bg-white/5 text-[#5a5675] border border-white/10"
                      )}
                    >
                      {p === 'Hot' ? '🔴 Hot' : p === 'Warm' ? '🟡 Warm' : '🔵 Cold'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button disabled={!isStep1Valid} onClick={() => setStep(2)} className="w-full h-14">Next →</Button>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Address & Interest</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Area (Optional)</label>
                <input 
                  autoFocus
                  value={formData.area || ''} 
                  onChange={e => setFormData({...formData, area: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0]" 
                  placeholder="e.g. Malviya Nagar"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">City (Optional)</label>
                  <input 
                    value={formData.city || ''} 
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0]" 
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">District *</label>
                  <input 
                    value={districtSearch || formData.district || ''} 
                    onChange={e => {
                      setDistrictSearch(e.target.value);
                      setShowDistrictList(true);
                    }}
                    onFocus={() => setShowDistrictList(true)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (filteredDistricts.length === 1) {
                          const d = filteredDistricts[0];
                          setFormData({...formData, district: d, state: DISTRICT_STATE_MAP[d]});
                          setDistrictSearch(d);
                          setShowDistrictList(false);
                        } else if (isStep2Valid) {
                          handleSave();
                        }
                      }
                    }}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] px-4 focus:outline-none focus:border-[#7c6cf0]" 
                    placeholder="Search District"
                  />
                  {showDistrictList && filteredDistricts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 glass border border-white/10 rounded-xl overflow-hidden z-10">
                      {filteredDistricts.map(d => (
                        <button
                          key={d}
                          onClick={() => {
                            setFormData({...formData, district: d, state: DISTRICT_STATE_MAP[d]});
                            setDistrictSearch(d);
                            setShowDistrictList(false);
                          }}
                          className="w-full p-3 text-left text-xs hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">State</label>
                <div className="w-full h-12 bg-white/5 border border-white/5 rounded-[12px] px-4 flex items-center justify-between text-[#5a5675]">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className={cn(formData.state ? "text-[#f0eff8]" : "text-[#5a5675]")}>
                      {formData.state || 'Auto-filled from district'}
                    </span>
                  </div>
                  <Lock size={14} className="opacity-50" />
                </div>
                <p className="text-[10px] text-[#5a5675] italic">Auto-filled from district</p>
              </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">What are they interested in?</label>
        {INTEREST_CATEGORIES.map(cat => (
          <div key={cat.label} className="space-y-2">
            <p className="text-[10px] text-[#5a5675] font-bold uppercase">{cat.label}</p>
            <div className="flex flex-wrap gap-2">
              {cat.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    const current = formData.interests || [];
                    const next = current.includes(opt) ? current.filter(i => i !== opt) : [...current, opt];
                    setFormData({...formData, interests: next});
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-2",
                    formData.interests?.includes(opt)
                      ? "bg-[#7c6cf0] border-[#7c6cf0] text-white"
                      : "bg-white/5 border-white/10 text-[#9994b8]"
                  )}
                >
                  {formData.interests?.includes(opt) && <CheckCircle2 size={12} />}
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Remark</label>
                  <span className="text-[10px] font-mono text-[#5a5675]">{(formData.remark?.length || 0)}/300</span>
                </div>
                <textarea 
                  maxLength={300}
                  value={formData.remark || ''} 
                  onChange={e => setFormData({...formData, remark: e.target.value})}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-[12px] p-4 focus:outline-none focus:border-[#7c6cf0] resize-none text-sm" 
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Agent Name</label>
                <div className="w-full h-12 bg-white/5 border border-white/5 rounded-[12px] px-4 flex items-center gap-2 text-[#5a5675]">
                  <Lock size={14} className="opacity-50" />
                  <span className="text-sm">{agentName}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14">← Back</Button>
              <Button 
                disabled={!isStep2Valid} 
                onClick={handleSave} 
                className="flex-1 h-14"
              >
                {isSaving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (initialLeadData ? 'Update Lead' : 'Save Lead')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenWrapper>
  );
};

const HybridEntryFlow = ({ onCancel, onSave, expo, agentName, allLeads }: { onCancel: () => void, onSave: (lead: Lead) => void, expo: Expo, agentName: string, allLeads: Lead[] }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Lead | null>(null);
  const [showCamera, setShowCamera] = useState<{ side: 'front' | 'back' } | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    priority: 'Warm',
    interests: [],
    agentName,
    expoId: expo.id,
    entryMethod: 'hybrid',
    synced: false,
    timestamp: new Date().toISOString()
  });

  const handleMobileBlur = (mobile: string) => {
    if (mobile.length === 10) {
      const duplicate = allLeads.find(l => l.mobile === mobile);
      if (duplicate) setDuplicateWarning(duplicate);
      else setDuplicateWarning(null);
    }
  };

  const handleScan = async (frontBase64: string) => {
    setIsProcessing(true);
    setScanError(null);
    try {
      const data = await scanVisitingCard(frontBase64);
      setFormData(prev => ({
        ...prev,
        ...data,
        cardFrontImage: frontBase64
      }));
    } catch (error) {
      console.error("OCR Error:", error);
      setScanError("AI extraction failed. Please fill details manually.");
      setFormData(prev => ({
        ...prev,
        cardFrontImage: frontBase64
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const isStep1Valid = formData.name && formData.mobile?.length === 10 && formData.firmName;

  if (showCamera) {
    return (
      <CameraCapture 
        onCapture={(base64) => {
          if (showCamera.side === 'front') {
            setFormData(prev => ({ ...prev, cardFrontImage: base64 }));
            handleScan(base64);
          } else {
            setFormData(prev => ({ ...prev, cardBackImage: base64 }));
          }
          setShowCamera(null);
        }}
        onCancel={() => setShowCamera(null)}
      />
    );
  }

  return (
    <ScreenWrapper>
      <header className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="p-2 -ml-2 text-[#9994b8]"><X size={24} /></button>
        <div className="flex gap-2">
          {[1, 2].map(s => (
            <div key={s} className={cn("w-8 h-1.5 rounded-full transition-colors", step >= s ? "bg-[#7c6cf0]" : "bg-white/10")} />
          ))}
        </div>
        <div className="w-10" />
      </header>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Scan Visiting Card</h2>
          <p className="text-sm text-[#9994b8]">Take clear photos of both sides</p>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className="aspect-[3/2] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 bg-white/5 cursor-pointer relative overflow-hidden group active:border-[#7c6cf0] transition-colors"
              onClick={() => setShowCamera({ side: 'front' })}
            >
              {formData.cardFrontImage ? (
                <div className="absolute inset-0 bg-white/10 flex items-center justify-center text-xs font-bold">Front Captured</div>
              ) : (
                <>
                  <Camera size={24} className="text-[#5a5675] group-active:text-[#7c6cf0] transition-colors" />
                  <span className="text-[10px] font-bold uppercase text-[#5a5675]">Front Side *</span>
                </>
              )}
            </div>
            <div 
              className="aspect-[3/2] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 bg-white/5 cursor-pointer relative overflow-hidden group active:border-[#7c6cf0] transition-colors"
              onClick={() => setShowCamera({ side: 'back' })}
            >
              {formData.cardBackImage ? (
                <div className="absolute inset-0 bg-white/10 flex items-center justify-center text-xs font-bold">Back Captured</div>
              ) : (
                <>
                  <Camera size={24} className="text-[#5a5675] group-active:text-[#7c6cf0] transition-colors" />
                  <span className="text-[10px] font-bold uppercase text-[#5a5675]">Back Side *</span>
                </>
              )}
            </div>
          </div>

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 glass border border-[#7c6cf0]/20 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7c6cf0]/10 to-transparent animate-shimmer" />
              <div className="flex items-center gap-4 relative z-10">
                <RefreshCw size={24} className="text-[#7c6cf0] animate-spin" />
                <p className="text-sm font-medium text-[#7c6cf0]">Gemini AI is extracting details...</p>
              </div>
            </motion.div>
          )}

          {scanError && !isProcessing && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {scanError}
            </div>
          )}

          {formData.cardFrontImage && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="p-4 bg-[#7c6cf0]/5 border-[#7c6cf0]/20 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Name</label>
                    {formData.name && <span className="text-[8px] font-bold text-[#7c6cf0] uppercase tracking-widest">✦ Auto-filled</span>}
                  </div>
                  <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-white/10 pb-1 focus:outline-none focus:border-[#7c6cf0] text-sm" placeholder="Full Name" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Mobile</label>
                    {formData.mobile && <span className="text-[8px] font-bold text-[#7c6cf0] uppercase tracking-widest">✦ Auto-filled</span>}
                  </div>
                  <input 
                    value={formData.mobile || ''} 
                    onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} 
                    onBlur={e => handleMobileBlur(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-1 focus:outline-none focus:border-[#7c6cf0] font-mono text-sm" 
                    placeholder="10-digit mobile"
                  />
                  {duplicateWarning && (
                    <div className="mt-2 p-2 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center gap-2 text-[#fbbf24] text-[10px] font-medium">
                      <AlertCircle size={12} />
                      Already captured — {duplicateWarning.name}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Firm</label>
                    {formData.firmName && <span className="text-[8px] font-bold text-[#7c6cf0] uppercase tracking-widest">✦ Auto-filled</span>}
                  </div>
                  <input value={formData.firmName || ''} onChange={e => setFormData({...formData, firmName: e.target.value})} className="w-full bg-transparent border-b border-white/10 pb-1 focus:outline-none focus:border-[#7c6cf0] text-sm" placeholder="Company Name" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">District</label>
                    {formData.district && <span className="text-[8px] font-bold text-[#7c6cf0] uppercase tracking-widest">✦ Auto-filled</span>}
                  </div>
                  <input value={formData.district || ''} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-transparent border-b border-white/10 pb-1 focus:outline-none focus:border-[#7c6cf0] text-sm" placeholder="District" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Address / Area</label>
                    {formData.area && <span className="text-[8px] font-bold text-[#7c6cf0] uppercase tracking-widest">✦ Auto-filled</span>}
                  </div>
                  <input value={formData.area || ''} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-transparent border-b border-white/10 pb-1 focus:outline-none focus:border-[#7c6cf0] text-sm" placeholder="Area" />
                </div>
              </Card>
              <p className="text-[10px] text-[#5a5675] text-center italic">Looks correct? Confirm fields above then proceed.</p>
              <Button disabled={!isStep1Valid} onClick={() => setStep(2)} className="w-full h-14">Next →</Button>
            </motion.div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Remaining Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Priority *</label>
              <div className="flex gap-2">
                {(['Hot', 'Warm', 'Cold'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setFormData({...formData, priority: p})}
                    className={cn(
                      "flex-1 h-12 rounded-[12px] text-xs font-bold uppercase tracking-widest transition-all",
                      formData.priority === p 
                        ? p === 'Hot' ? "bg-[#f87171] text-white" : p === 'Warm' ? "bg-[#fbbf24] text-black" : "bg-[#60a5fa] text-white"
                        : "bg-white/5 text-[#5a5675] border border-white/10"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Interests</label>
              {INTEREST_CATEGORIES.map(cat => (
                <div key={cat.label} className="space-y-2">
                  <p className="text-[10px] text-[#5a5675] font-bold uppercase">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          const current = formData.interests || [];
                          const next = current.includes(opt) ? current.filter(i => i !== opt) : [...current, opt];
                          setFormData({...formData, interests: next});
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-2",
                          formData.interests?.includes(opt)
                            ? "bg-[#7c6cf0] border-[#7c6cf0] text-white"
                            : "bg-white/5 border-white/10 text-[#9994b8]"
                        )}
                      >
                        {formData.interests?.includes(opt) && <CheckCircle2 size={12} />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Remark</label>
                <span className="text-[10px] font-mono text-[#5a5675]">{(formData.remark?.length || 0)}/300</span>
              </div>
              <textarea 
                maxLength={300}
                value={formData.remark || ''} 
                onChange={e => setFormData({...formData, remark: e.target.value})}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-[12px] p-4 focus:outline-none focus:border-[#7c6cf0] resize-none text-sm" 
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5a5675] uppercase tracking-widest">Agent Name</label>
              <div className="w-full h-12 bg-white/5 border border-white/5 rounded-[12px] px-4 flex items-center gap-2 text-[#5a5675]">
                <Lock size={14} className="opacity-50" />
                <span className="text-sm">{agentName}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14">← Back</Button>
            <Button 
              onClick={() => {
                setIsSaving(true);
                setTimeout(() => {
                  onSave({...formData, id: `lead_${Date.now()}`} as Lead);
                  setIsSaving(false);
                }, 1000);
              }} 
              className="flex-1 h-14"
            >
              {isSaving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Lead'}
            </Button>
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
};

const SuccessScreen = ({ lead, expoName, onAddAnother, onViewAll }: { lead: Lead, expoName: string, onAddAnother: () => void, onViewAll: () => void }) => {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-[100] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="w-24 h-24 rounded-full bg-[#34d399]/10 flex items-center justify-center text-[#34d399] mb-8"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 stroke-current stroke-[3]">
          <motion.path 
            d="M20 6L9 17L4 12" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
      <h2 className="text-3xl font-bold mb-2">Lead Saved</h2>
      <div className="mb-4">
        <p className="text-[#9994b8] text-sm">{lead.name} · {lead.firmName}</p>
      </div>
      
      {lead.cardFrontImage && (
        <div className="mb-6 w-full max-w-[240px] aspect-[3/2] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <img src={lead.cardFrontImage} alt="Scanned Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}
      
      <div className="mb-6">
        <PriorityBadge priority={lead.priority} />
      </div>

      <div className="space-y-3 w-full max-w-xs mb-12">
        <div className="p-4 rounded-xl bg-[#34d399]/10 border border-[#34d399]/20 flex items-center gap-3 text-[#34d399] text-xs font-medium">
          <div className="w-8 h-8 rounded-full bg-[#34d399]/20 flex items-center justify-center">
            <MessageSquare size={16} />
          </div>
          <span className="text-left">WhatsApp greeting queued for {lead.mobile}</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-2 text-[#5a5675] text-[10px] font-bold uppercase tracking-widest">
          Tagged: {expoName} · {lead.priority}
        </div>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <Button onClick={onAddAnother} className="w-full h-14 text-lg">Add Another Lead</Button>
        <Button variant="ghost" onClick={onViewAll} className="w-full h-14 text-[#9994b8]">View All Leads</Button>
      </div>
    </div>
  );
};

const LeadsList = ({ expo, onSelectLead, onBack }: { expo: Expo, onSelectLead: (lead: Lead) => void, onBack: () => void }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredLeads = expo.leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.firmName.toLowerCase().includes(search.toLowerCase()) || 
                          l.mobile.includes(search);
    const matchesFilter = filter === 'All' || l.priority === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <ScreenWrapper>
      <header className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-[#9994b8]"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-bold">All Leads</h1>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5675]" size={18} />
        <input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, mobile, firm..." 
          className="w-full h-12 bg-white/5 border border-white/10 rounded-[12px] pl-12 pr-4 focus:outline-none focus:border-[#7c6cf0]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 mb-2">
        {['All', 'Hot', 'Warm', 'Cold'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
              filter === f ? "bg-[#7c6cf0] text-white" : "bg-white/5 text-[#5a5675] border border-white/10"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredLeads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="cursor-pointer active:scale-[0.98] transition-all" onClick={() => onSelectLead(lead)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold">{lead.name}</h4>
                    <p className="text-xs text-[#9994b8]">{lead.firmName}</p>
                  </div>
                  <PriorityBadge priority={lead.priority} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-mono text-[#5a5675]">{lead.mobile}</span>
                  <div className="flex items-center gap-2">
                    {lead.entryMethod === 'hybrid' ? <Camera size={12} className="text-[#5a5675]" /> : <Pencil size={12} className="text-[#5a5675]" />}
                    <div className={cn("w-1.5 h-1.5 rounded-full", lead.synced ? "bg-[#34d399]" : "bg-[#fbbf24]")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="text-center py-20 text-[#5a5675]">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No leads found.</p>
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
};

const LeadDetail = ({ lead, expoName, onBack, onEdit }: { lead: Lead, expoName: string, onBack: () => void, onEdit: () => void }) => {
  return (
    <ScreenWrapper>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-[#9994b8]"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-bold truncate max-w-[200px]">{lead.name}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit} className="text-[#7c6cf0]">Edit</Button>
      </header>

      <div className="space-y-6">
        <Card className="bg-[#7c6cf0]/5 border-[#7c6cf0]/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-1">{lead.name}</h2>
            <p className="text-[#9994b8] mb-4">{lead.firmName}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <PriorityBadge priority={lead.priority} />
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">{lead.entryMethod}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">{expoName}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Contact</h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9994b8]">Mobile</span>
                  <span className="font-mono font-medium">{lead.mobile}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9994b8]">Firm</span>
                  <span className="font-medium">{lead.firmName}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Address</h3>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">
                  {lead.area && `${lead.area}, `}{lead.city}, {lead.district}, {lead.state}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {lead.interests.map(i => (
                <span key={i} className="px-3 py-1 rounded-full bg-[#7c6cf0]/10 text-[#7c6cf0] text-xs font-medium border border-[#7c6cf0]/20">{i}</span>
              ))}
              {lead.remark && (
                <Card className="w-full mt-2">
                  <CardContent className="p-4">
                    <p className="text-xs text-[#9994b8] italic">"{lead.remark}"</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {lead.cardFrontImage && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-[#5a5675] uppercase tracking-widest">Visiting Card</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-[3/2] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#5a5675] uppercase">Front</div>
                <div className="aspect-[3/2] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#5a5675] uppercase">Back</div>
              </div>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#5a5675] font-mono uppercase">
              <span>Agent: {lead.agentName}</span>
              <span>{new Date(lead.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};
