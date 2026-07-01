import type { ReactNode } from 'react';

/**
 * Rendu markdown léger (sans dépendance) suffisant pour les fiches statiques :
 * titres `##`/`###`, gras `**…**`, listes `- `, tableaux GFM et paragraphes.
 * Les icônes de section sont des emojis inclus dans le texte des titres.
 */

/** Découpe une ligne de tableau `| a | b |` en cellules. */
function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

const isSeparator = (line: string) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');

/** Rendu inline : **gras** uniquement. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Tableau GFM (en-tête + ligne de séparation).
    if (line.trim().startsWith('|') && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface-2 text-left">
                {header.map((h, c) => (
                  <th key={c} className="border-b border-border px-2.5 py-1.5 font-semibold text-ink">
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="align-top">
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`border-b border-border px-2.5 py-1.5 ${ci === 0 ? 'text-ink' : 'text-muted'}`}
                    >
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Titres.
    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={key++} className="mt-3 text-sm font-semibold text-ink">
          {inline(line.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={key++} className="mt-4 border-t border-border/50 pt-3 text-base font-semibold text-ink">
          {inline(line.slice(3))}
        </h3>,
      );
      i++;
      continue;
    }

    // Liste à puces.
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*] /, ''));
        i++;
      }
      blocks.push(
        <ul key={key++} className="space-y-1">
          {items.map((it, ii) => (
            <li key={ii} className="flex items-start gap-2 text-ink">
              <span
                className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: 'var(--color-modere)' }}
              />
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Paragraphe (jusqu'à une ligne vide ou un autre bloc).
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !/^\s*[-*] /.test(lines[i]) &&
      !lines[i].trim().startsWith('|')
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="leading-relaxed text-ink">
        {inline(para.join(' '))}
      </p>,
    );
  }

  return <div className="space-y-2 text-sm">{blocks}</div>;
}
