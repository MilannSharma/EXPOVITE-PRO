export const DISTRICT_STATE_MAP: Record<string, string> = {
  "Jaipur": "Rajasthan",
  "Jodhpur": "Rajasthan",
  "Udaipur": "Rajasthan",
  "Kota": "Rajasthan",
  "Ajmer": "Rajasthan",
  "Bikaner": "Rajasthan",
  "Alwar": "Rajasthan",
  "New Delhi": "Delhi",
  "Mumbai": "Maharashtra",
  "Pune": "Maharashtra",
  "Nagpur": "Maharashtra",
  "Bengaluru": "Karnataka",
  "Mysuru": "Karnataka",
  "Hyderabad": "Telangana",
  "Chennai": "Tamil Nadu",
  "Kolkata": "West Bengal",
  "Ahmedabad": "Gujarat",
  "Surat": "Gujarat",
  "Vadodara": "Gujarat",
  "Lucknow": "Uttar Pradesh",
  "Kanpur": "Uttar Pradesh",
  "Indore": "Madhya Pradesh",
  "Bhopal": "Madhya Pradesh",
  "Patna": "Bihar",
  "Chandigarh": "Punjab",
  "Ludhiana": "Punjab",
  "Amritsar": "Punjab",
  "Kochi": "Kerala",
  "Thiruvananthapuram": "Kerala",
  "Guwahati": "Assam",
  "Bhubaneswar": "Odisha",
  "Raipur": "Chhattisgarh",
  "Ranchi": "Jharkhand",
  "Dehradun": "Uttarakhand",
  "Shimla": "Himachal Pradesh",
  "Panaji": "Goa"
};

export const DISTRICTS = Object.keys(DISTRICT_STATE_MAP).sort();

export const INTEREST_CATEGORIES = [
  {
    label: "Available Products",
    options: ["ID Cards", "Raw Material", "Bio Matrics", "Evolis Printer"]
  }
];

export type Priority = "Hot" | "Warm" | "Cold";

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  firmName: string;
  priority: Priority;
  area?: string;
  city: string;
  district: string;
  state: string;
  interests: string[];
  otherInterest?: string;
  remark?: string;
  agentName: string;
  cardFrontImage?: string;
  cardBackImage?: string;
  timestamp: string;
  entryMethod: "manual" | "hybrid";
  synced: boolean;
  expoId: string;
}

export interface Expo {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  followUpDate: string;
  status: "active" | "upcoming" | "ended";
  leads: Lead[];
}

export interface AppData {
  agent: { name: string; id: string };
  expos: Expo[];
  settings: {
    followUpReminderEnabled: boolean;
    whatsappAutoMessage: boolean;
  };
}
