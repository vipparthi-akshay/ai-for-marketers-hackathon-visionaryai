import { create } from "zustand";

interface Business {
  id: string;
  name: string;
  industry: string;
  description?: string;
  marketing_score: number;
}

interface BusinessState {
  businesses: Business[];
  activeBusiness: Business | null;
  setBusinesses: (businesses: Business[]) => void;
  setActiveBusiness: (business: Business | null) => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  businesses: [],
  activeBusiness: null,
  setBusinesses: (businesses) => set({ businesses }),
  setActiveBusiness: (business) => set({ activeBusiness: business }),
}));
