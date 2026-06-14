/**
 * Store global d'activité IA, indépendant du cycle de vie des composants :
 * une analyse lancée continue même si l'utilisateur quitte l'écran.
 * Sert à alimenter l'indicateur « IA » de l'en-tête (sablier qui tourne → vert).
 */
interface Task {
  id: string;
  label: string;
  startedAt: number;
}

export interface AiSnapshot {
  count: number; // tâches en cours
  startedAt: number | null; // début de la plus ancienne (pour le décompte)
  labels: string[];
  flashUntil: number; // « terminé » (vert) jusqu'à ce timestamp
}

const FLASH_MS = 4000;

let tasks: Task[] = [];
let flashUntil = 0;
const subscribers = new Set<() => void>();
let snapshot: AiSnapshot = compute();

function compute(): AiSnapshot {
  return {
    count: tasks.length,
    startedAt: tasks.length ? Math.min(...tasks.map((t) => t.startedAt)) : null,
    labels: tasks.map((t) => t.label),
    flashUntil,
  };
}

function emit() {
  snapshot = compute();
  subscribers.forEach((cb) => cb());
}

export function subscribeAi(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function getAiSnapshot(): AiSnapshot {
  return snapshot;
}

/**
 * Exécute une tâche IA en l'enregistrant globalement. Le travail (appel réseau +
 * écriture en cache, réalisés par `fn`) se poursuit indépendamment des composants.
 * À la réussite, déclenche un « flash » vert temporaire.
 */
export async function runAiTask<T>(
  label: string,
  fn: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  tasks = [...tasks, { id, label, startedAt: Date.now() }];
  emit();
  const ctrl = new AbortController();
  try {
    const result = await fn(ctrl.signal);
    flashUntil = Date.now() + FLASH_MS; // succès → vert
    return result;
  } finally {
    tasks = tasks.filter((t) => t.id !== id);
    emit();
    // Efface le flash vert une fois écoulé.
    setTimeout(emit, FLASH_MS + 100);
  }
}
