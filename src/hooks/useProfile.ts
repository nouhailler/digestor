import { useLiveQuery } from 'dexie-react-hooks';
import type { Profile } from '../types';
import { getProfile, setProfile } from '../lib/db';

/**
 * Profil santé en live (nom, conditions, intolérances, allergies…).
 * `profile` vaut `undefined` tant que le chargement n'est pas terminé.
 */
export function useProfile() {
  const profile = useLiveQuery(() => getProfile(), []);
  return {
    profile,
    save: (next: Profile) => setProfile(next),
    update: async (patch: Partial<Profile>) => {
      const current = await getProfile();
      await setProfile({ ...current, ...patch });
    },
  };
}
