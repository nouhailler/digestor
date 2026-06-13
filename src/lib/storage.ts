/**
 * Demande au navigateur de rendre le stockage local (IndexedDB) « persistant »
 * afin de limiter son effacement automatique (notamment l'éviction iOS/Safari
 * après quelques jours d'inactivité). Best-effort : ne bloque jamais.
 */
export async function ensurePersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Indique si le stockage est déjà marqué persistant (pour affichage). */
export async function isStoragePersisted(): Promise<boolean> {
  try {
    return (await navigator.storage?.persisted?.()) ?? false;
  } catch {
    return false;
  }
}
