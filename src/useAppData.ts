import { useState, useEffect } from 'react';
import { AppData, Expo, Lead } from './types';

const STORAGE_KEY = 'expovite_data';

const MOCK_DATA: AppData = {
  agent: { name: "Rahul Sharma", id: "agent_rahul" },
  expos: [
    {
      id: "expo_1",
      name: "PrintPack India 2025",
      location: "Greater Noida",
      startDate: "2025-02-01",
      endDate: "2025-02-06",
      followUpDate: "2025-02-07",
      status: "ended",
      leads: [
        {
          id: "lead_1",
          name: "Amit Patel",
          mobile: "9876543210",
          firmName: "Patel Graphics",
          priority: "Hot",
          city: "Ahmedabad",
          district: "Ahmedabad",
          state: "Gujarat",
          interests: ["Evolis Printer", "ID Cards"],
          agentName: "Rahul Sharma",
          timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
          entryMethod: "manual",
          synced: true,
          expoId: "expo_1"
        }
      ]
    },
    {
      id: "expo_2",
      name: "Media Expo Mumbai",
      location: "Mumbai",
      startDate: "2025-05-10",
      endDate: "2025-05-12",
      followUpDate: "2025-05-13",
      status: "upcoming",
      leads: []
    },
    {
      id: "expo_3",
      name: "Stationery World 2026",
      location: "Jaipur",
      startDate: "2026-03-20",
      endDate: "2026-03-28",
      followUpDate: "2026-03-29",
      status: "active",
      leads: [
        {
          id: "lead_2",
          name: "Suresh Kumar",
          mobile: "9988776655",
          firmName: "Kumar Stationers",
          priority: "Warm",
          city: "Jaipur",
          district: "Jaipur",
          state: "Rajasthan",
          interests: ["Raw Material", "Lanyards"],
          agentName: "Rahul Sharma",
          timestamp: new Date().toISOString(),
          entryMethod: "hybrid",
          synced: false,
          expoId: "expo_3"
        }
      ]
    }
  ],
  settings: {
    followUpReminderEnabled: true,
    whatsappAutoMessage: true
  }
};

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_DATA;
      }
    }
    return MOCK_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addExpo = (expo: Expo) => {
    setData(prev => ({
      ...prev,
      expos: [expo, ...prev.expos]
    }));
  };

  const addLead = (expoId: string, lead: Lead) => {
    setData(prev => ({
      ...prev,
      expos: prev.expos.map(expo => 
        expo.id === expoId 
          ? { ...expo, leads: [lead, ...expo.leads] }
          : expo
      )
    }));
  };

  const updateLead = (expoId: string, leadId: string, updatedLead: Lead) => {
    setData(prev => ({
      ...prev,
      expos: prev.expos.map(expo => 
        expo.id === expoId 
          ? { ...expo, leads: expo.leads.map(l => l.id === leadId ? updatedLead : l) }
          : expo
      )
    }));
  };

  const updateAgentName = (name: string) => {
    setData(prev => ({
      ...prev,
      agent: { ...prev.agent, name }
    }));
  };

  const updateSettings = (settings: Partial<AppData['settings']>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  return { data, addExpo, addLead, updateLead, updateAgentName, updateSettings };
}
