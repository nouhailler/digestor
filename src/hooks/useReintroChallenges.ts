import { useLiveQuery } from 'dexie-react-hooks';
import type { ReintroChallenge } from '../types';
import { getAllReintroChallenges } from '../lib/db';

/** Liste, en live, des tests de réintroduction FODMAP (du plus récent au plus ancien). */
export function useReintroChallenges(): ReintroChallenge[] {
  return useLiveQuery(() => getAllReintroChallenges(), []) ?? [];
}
