// src/store/useProfileStore.ts
// Store para el perfil TIER 1 del usuario — cargado desde users_profile de Supabase

import { create } from 'zustand';
import { type UserProfile } from '../lib/supabase';
import { profileService } from '../services/profileService';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;

  loadProfile: (userId: string, userName?: string) => Promise<void>;
  updateGoal: (field: keyof UserProfile, value: number | string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,

  loadProfile: async (userId: string, userName?: string) => {
    set({ isLoading: true });
    try {
      let profile = await profileService.getProfile(userId);

      if (!profile) {
        // Primer login: inicializar todos los datos del usuario
        const name = userName ?? 'Alice';
        await profileService.initializeNewUser(userId, name);
        profile = await profileService.getProfile(userId);
      }

      set({ profile });
    } finally {
      set({ isLoading: false });
    }
  },

  updateGoal: async (field, value) => {
    const { profile } = get();
    if (!profile) return;

    const updated = { ...profile, [field]: value } as UserProfile;
    set({ profile: updated }); // Optimistic update

    await profileService.updateProfile(profile.user_id, { [field]: value });
  },
}));
