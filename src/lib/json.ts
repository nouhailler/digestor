/**
 * Extrait un objet JSON d'un texte potentiellement entouré de prose ou de
 * balises Markdown (```json … ```). Lève si aucun JSON valide n'est trouvé.
 */
export function parseJsonLoose<T>(text: string): T {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t) as T;
}
