import { Sheet } from './Sheet';
import { Markdown } from './Markdown';
import { amineArticle } from '../lib/amineArticles';

interface AmineArticleSheetProps {
  open: boolean;
  /** Nom de l'amine (ex. « Histamine ») ; la fiche est résolue par nom. */
  name: string;
  onClose: () => void;
}

/** Fiche encyclopédique détaillée d'une amine biogène (contenu markdown). */
export function AmineArticleSheet({ open, name, onClose }: AmineArticleSheetProps) {
  const article = amineArticle(name);
  return (
    <Sheet open={open && !!article} title={article?.name ?? name} onClose={onClose}>
      {article && (
        <>
          <Markdown content={article.markdown} />
          <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted">
            Fiche informative détaillée, non médicale. La teneur en amines des aliments varie beaucoup selon la
            fraîcheur et l'affinage.
          </p>
        </>
      )}
    </Sheet>
  );
}
