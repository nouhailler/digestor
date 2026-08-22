#!/usr/bin/env node
/**
 * Génère le site de documentation statique de Digestor.
 *
 *   docs/**.md  →  public/docs/index.html
 *
 * Une seule page autonome (aucune dépendance, aucun CDN) : sommaire en
 * accordéons, recherche client, thème clair/sombre, URLs stables par ancre
 * (`#/features/satiete`). Le build échoue si un lien interne est cassé —
 * cf. DOCUMENTATION_SPEC.md §47 et §52.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, REPO_URL } from './docs-manifest.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const OUT_DIR = join(ROOT, 'public', 'docs');
const OUT = join(OUT_DIR, 'index.html');

const APP_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const DOC_VERSION = '1.0.0';

// ---------------------------------------------------------------- utilitaires

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Ancre d'un titre, calquée sur la convention GitHub (accents conservés). */
export function slug(text) {
  return text
    .toLowerCase()
    .replace(/`|\*|_|~/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Identifiant de page : chemin sans extension, `index` réduit au dossier. */
const pageId = (file) => file.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1').replace(/\/$/, '') || 'index';

// ------------------------------------------------------- rendu Markdown (sous-ensemble)

/** Rendu des marques en ligne. `linkFn` transforme une cible en href final. */
function inline(text, linkFn) {
  let out = esc(text);
  // code d'abord : son contenu ne doit plus être interprété
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, target) => {
    const { href, external } = linkFn(target);
    const attrs = external ? ' target="_blank" rel="noreferrer"' : '';
    return `<a href="${esc(href)}"${attrs}>${label}</a>`;
  });
  out = out.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
  out = out.replace(/&lt;([^\s@&]+@[^\s@&]+\.[a-z]{2,})&gt;/gi, '<a href="mailto:$1">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return out;
}

function renderTable(rows, linkFn) {
  const cells = (line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  const th = head.map((c) => `<th>${inline(c, linkFn)}</th>`).join('');
  const tb = body
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c, linkFn)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
}

/** Convertit un document Markdown en HTML. Renvoie aussi ses titres (pour la recherche). */
function renderMarkdown(md, linkFn) {
  const lines = md.split('\n');
  const html = [];
  const headings = [];
  let i = 0;

  const flushList = (ordered, items) => {
    const tag = ordered ? 'ol' : 'ul';
    html.push(`<${tag}>${items.map((t) => `<li>${inline(t, linkFn)}</li>`).join('')}</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // code fencé
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // séparateur
    if (/^---+\s*$/.test(line)) { html.push('<hr>'); i++; continue; }

    // titre
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const raw = h[2].trim();
      const id = slug(raw);
      headings.push({ level, text: raw.replace(/`|\*\*|\*/g, ''), id });
      html.push(`<h${level} id="${esc(id)}">${inline(raw, linkFn)}<a class="anchor" href="#" data-anchor="${esc(id)}" aria-label="Lien vers cette section">#</a></h${level}>`);
      i++;
      continue;
    }

    // citation
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${inline(buf.join(' ').trim(), linkFn)}</blockquote>`);
      continue;
    }

    // tableau
    if (/^\|/.test(line) && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] ?? '')) {
      const buf = [];
      while (i < lines.length && /^\|/.test(lines[i])) buf.push(lines[i++]);
      html.push(renderTable(buf, linkFn));
      continue;
    }

    // listes (à puces ou numérotées), avec continuations indentées
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = !!numbered;
      const items = [];
      while (i < lines.length) {
        const m = ordered ? lines[i].match(/^\s*\d+\.\s+(.*)$/) : lines[i].match(/^\s*[-*]\s+(.*)$/);
        if (m) { items.push(m[1]); i++; continue; }
        if (/^\s+\S/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
        break;
      }
      flushList(ordered, items);
      continue;
    }

    // paragraphe
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>|\||\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    if (buf.length) html.push(`<p>${inline(buf.join(' ').trim(), linkFn)}</p>`);
  }

  return { html: html.join('\n'), headings };
}

// ------------------------------------------------------------------- collecte

const pages = [];
for (const chapter of CHAPTERS) {
  for (const p of chapter.pages) {
    const abs = join(DOCS, p.file);
    if (!existsSync(abs)) {
      console.error(`✗ Page manquante : docs/${p.file}`);
      process.exitCode = 1;
      continue;
    }
    pages.push({ ...p, chapter: chapter.title, id: pageId(p.file), md: readFileSync(abs, 'utf8') });
  }
}

const byId = new Map(pages.map((p) => [p.id, p]));
const problems = [];

/** Résout un lien Markdown relatif au fichier courant. */
function makeLinkFn(page) {
  const dir = posix.dirname(page.file);
  return (target) => {
    if (/^(https?:)?\/\//.test(target) || target.startsWith('mailto:')) {
      return { href: target, external: true };
    }
    if (target.startsWith('#')) {
      const a = target.slice(1);
      if (!page.anchors.has(a)) problems.push(`${page.file} → ancre inconnue « #${a} »`);
      return { href: `#/${page.id}?a=${encodeURIComponent(a)}`, external: false };
    }
    const [rawPath, anchor] = target.split('#');
    const norm = posix.normalize(posix.join(dir, rawPath));
    // Fichier du dépôt hors du dossier docs/ (CHANGELOG, LICENSE…)
    if (norm.startsWith('..')) {
      return { href: `${REPO_URL}/blob/main/${norm.replace(/^(\.\.\/)+/, '')}`, external: true };
    }
    const id = pageId(norm);
    const dest = byId.get(id);
    if (!dest) {
      problems.push(`${page.file} → page inconnue « ${target} »`);
      return { href: '#/index', external: false };
    }
    if (anchor && !dest.anchors.has(anchor)) {
      problems.push(`${page.file} → ancre inconnue « ${target} »`);
    }
    return { href: anchor ? `#/${id}?a=${encodeURIComponent(anchor)}` : `#/${id}`, external: false };
  };
}

// 1re passe : ancres disponibles par page (nécessaire avant de vérifier les liens)
for (const p of pages) {
  p.anchors = new Set();
  for (const line of p.md.split('\n')) {
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) p.anchors.add(slug(h[2].trim()));
  }
}

// 2e passe : rendu + contrôle de liens
for (const p of pages) {
  const { html, headings } = renderMarkdown(p.md, makeLinkFn(p));
  p.html = html;
  p.headings = headings;
  p.text = p.md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`|_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} lien(s) cassé(s) dans la documentation :`);
  for (const m of problems) console.error(`  - ${m}`);
  process.exit(1);
}

// Contrôle « données sensibles » (DOCUMENTATION_SPEC.md §50)
const SECRET_RE = /\b(API_KEY|SECRET|PASSWORD|PRIVATE_KEY|sk-or-v1-[A-Za-z0-9]{8,})\b/;
for (const p of pages) {
  const hit = p.md.match(SECRET_RE);
  if (hit) {
    console.error(`✗ Motif sensible « ${hit[0]} » dans docs/${p.file}`);
    process.exit(1);
  }
}

// --------------------------------------------------------------------- sortie

const nav = CHAPTERS.map((c) => ({
  icon: c.icon,
  title: c.title,
  pages: c.pages.map((p) => ({ id: pageId(p.file), title: p.title })),
}));

const data = {
  appVersion: APP_VERSION,
  docVersion: DOC_VERSION,
  nav,
  pages: Object.fromEntries(
    pages.map((p) => [
      p.id,
      { title: p.title, chapter: p.chapter, html: p.html, headings: p.headings, text: p.text },
    ]),
  ),
  order: pages.map((p) => p.id),
};

const CSS = `
:root{--bg:#f6f6f7;--surface:#fff;--surface2:#eef0f2;--border:#d9dadf;--ink:#1a1a1d;--muted:#65656b;
--severe:#f0606a;--modere:#e8a13a;--leger:#5fbf6f;--absent:#6b6b70;--accent:#2f8f45}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e0e0f;--surface:#1c1c1e;--surface2:#242426;
--border:#2a2a2c;--ink:#ececec;--muted:#8a8a8e;--accent:#5fbf6f}}
:root[data-theme="dark"]{--bg:#0e0e0f;--surface:#1c1c1e;--surface2:#242426;--border:#2a2a2c;--ink:#ececec;--muted:#8a8a8e;--accent:#5fbf6f}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:16px/1.65 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
header.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 92%,transparent);
backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
.top-in{max-width:1180px;margin:0 auto;padding:.7rem 1rem;display:flex;align-items:center;gap:.75rem}
.brand{font-weight:600;font-size:1rem;white-space:nowrap}
.brand small{display:block;font-weight:400;font-size:.7rem;color:var(--muted)}
.spacer{flex:1}
.icon-btn{min-width:44px;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:.35rem;
background:var(--surface);color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:.4rem .7rem;
font:inherit;font-size:.82rem;cursor:pointer}
.icon-btn:hover{color:var(--ink)}
.layout{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:1.5rem;padding:1.25rem 1rem 4rem}
@media (max-width:900px){.layout{grid-template-columns:minmax(0,1fr)}
 nav.toc{display:none;position:static;max-height:none}
 nav.toc.open{display:block;margin-bottom:1rem}}
@media (min-width:901px){#menu-toggle{display:none}}
nav.toc{position:sticky;top:66px;align-self:start;max-height:calc(100vh - 84px);overflow-y:auto;padding-right:.25rem}
.search{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:.6rem;color:var(--ink);
padding:.6rem .75rem;font:inherit;font-size:.9rem;margin-bottom:.75rem}
.chapter{border:1px solid var(--border);border-radius:.75rem;background:var(--surface);margin-bottom:.5rem;overflow:hidden}
.chapter>button{width:100%;min-height:48px;display:flex;align-items:center;gap:.6rem;background:none;border:0;color:var(--ink);
font:inherit;font-size:.92rem;text-align:left;padding:.6rem .8rem;cursor:pointer}
.chapter>button .count{margin-left:auto;font-size:.72rem;color:var(--muted);background:var(--surface2);
border-radius:999px;padding:.1rem .45rem;min-width:1.5rem;text-align:center}
.chapter>button .chev{color:var(--muted);transition:transform .18s;font-size:.7rem}
.chapter[open-state="1"]>button .chev{transform:rotate(180deg)}
.chapter ul{list-style:none;margin:0 0 .5rem;padding:0 .6rem 0 1.1rem;border-left:2px solid var(--border);margin-left:1.15rem}
.chapter li a{display:block;min-height:40px;display:flex;align-items:center;padding:.35rem .5rem;border-radius:.45rem;
color:var(--muted);font-size:.87rem}
.chapter li a:hover{background:var(--surface2);color:var(--ink);text-decoration:none}
.chapter li a[aria-current="page"]{color:var(--ink);background:var(--surface2);font-weight:600;
box-shadow:inset 2px 0 0 var(--accent)}
main{min-width:0}
.crumb{font-size:.78rem;color:var(--muted);margin-bottom:.5rem}
article{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.4rem 1.5rem 2rem}
@media (max-width:640px){article{padding:1.1rem 1rem 1.6rem;border-radius:.75rem}}
article h1{font-size:1.6rem;margin:.2rem 0 1rem;line-height:1.25}
article h2{font-size:1.2rem;margin:1.9rem 0 .6rem;padding-bottom:.3rem;border-bottom:1px solid var(--border)}
article h3{font-size:1.02rem;margin:1.4rem 0 .4rem}
article h4{font-size:.95rem;margin:1.1rem 0 .3rem;color:var(--muted)}
article p{margin:.6rem 0}
article ul,article ol{margin:.6rem 0;padding-left:1.3rem}
article li{margin:.25rem 0}
article code{background:var(--surface2);border:1px solid var(--border);border-radius:.3rem;padding:.05rem .3rem;
font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85em}
article pre{background:var(--surface2);border:1px solid var(--border);border-radius:.6rem;padding:.8rem;overflow-x:auto}
article pre code{background:none;border:0;padding:0;font-size:.82em}
article blockquote{margin:.9rem 0;padding:.7rem .9rem;border-left:3px solid var(--modere);
background:var(--surface2);border-radius:0 .5rem .5rem 0;color:var(--ink)}
article hr{border:0;border-top:1px solid var(--border);margin:2rem 0}
.table-wrap{overflow-x:auto;margin:.9rem 0;border:1px solid var(--border);border-radius:.6rem}
table{border-collapse:collapse;width:100%;font-size:.88rem;min-width:26rem}
th,td{text-align:left;padding:.5rem .65rem;border-bottom:1px solid var(--border);vertical-align:top}
th{background:var(--surface2);font-weight:600;white-space:nowrap}
tbody tr:last-child td{border-bottom:0}
.anchor{opacity:0;margin-left:.4rem;color:var(--muted);font-weight:400;text-decoration:none}
h2:hover .anchor,h3:hover .anchor,h4:hover .anchor{opacity:1}
.pager{display:flex;gap:.75rem;justify-content:space-between;margin-top:1.25rem;flex-wrap:wrap}
.pager a{flex:1 1 40%;min-height:48px;display:flex;align-items:center;background:var(--surface);border:1px solid var(--border);
border-radius:.7rem;padding:.6rem .8rem;font-size:.85rem;color:var(--muted)}
.pager a:hover{color:var(--ink);text-decoration:none}
.pager a.next{justify-content:flex-end;text-align:right}
.results{list-style:none;margin:0;padding:0}
.results li{margin:.4rem 0}
.results a{display:block;background:var(--surface2);border:1px solid var(--border);border-radius:.6rem;padding:.55rem .7rem}
.results .cat{display:block;font-size:.72rem;color:var(--muted)}
.results .ex{display:block;font-size:.8rem;color:var(--muted);margin-top:.15rem}
footer.doc{max-width:1180px;margin:0 auto;padding:0 1rem 3rem;font-size:.78rem;color:var(--muted)}
`;

const JS = `
(function(){
var D=window.__DOCS__;var root=document.documentElement;
var THEME_KEY='digestor-docs-theme';
try{var t=localStorage.getItem(THEME_KEY);if(t)root.setAttribute('data-theme',t);}catch(e){}
document.getElementById('theme').onclick=function(){
  var cur=root.getAttribute('data-theme');
  var next=cur==='dark'?'light':cur==='light'?'dark':(matchMedia('(prefers-color-scheme: dark)').matches?'light':'dark');
  root.setAttribute('data-theme',next);
  try{localStorage.setItem(THEME_KEY,next);}catch(e){}
};
var toc=document.getElementById('toc');
document.getElementById('menu-toggle').onclick=function(){toc.classList.toggle('open');};

function parse(){
  var h=location.hash.replace(/^#\\/?/,'');
  var q=h.indexOf('?');var anchor=null;
  if(q>=0){var m=/a=([^&]*)/.exec(h.slice(q+1));if(m)anchor=decodeURIComponent(m[1]);h=h.slice(0,q);}
  if(!h||!D.pages[h])h='index';
  return {id:h,anchor:anchor};
}
function openChapterOf(id){
  document.querySelectorAll('.chapter').forEach(function(ch){
    if(ch.querySelector('a[data-id="'+CSS.escape(id)+'"]')){ch.setAttribute('open-state','1');ch.querySelector('ul').style.display='';}
  });
}
function render(){
  var r=parse();var p=D.pages[r.id];
  document.getElementById('crumb').innerHTML='<a href="#/index">Documentation</a> › '+p.chapter+' › '+p.title;
  document.getElementById('content').innerHTML=p.html;
  document.title=p.title+' — Documentation Digestor';
  document.querySelectorAll('.chapter li a').forEach(function(a){
    if(a.dataset.id===r.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  openChapterOf(r.id);
  var i=D.order.indexOf(r.id);
  var prev=i>0?D.order[i-1]:null,next=i<D.order.length-1?D.order[i+1]:null;
  document.getElementById('pager').innerHTML=
    (prev?'<a href="#/'+prev+'">← '+D.pages[prev].title+'</a>':'<span></span>')+
    (next?'<a class="next" href="#/'+next+'">'+D.pages[next].title+' →</a>':'<span></span>');
  document.querySelectorAll('#content .anchor').forEach(function(a){
    a.setAttribute('href','#/'+r.id+'?a='+encodeURIComponent(a.dataset.anchor));
  });
  toc.classList.remove('open');
  if(r.anchor){
    var el=document.getElementById(r.anchor);
    if(el){el.scrollIntoView();window.scrollBy(0,-70);return;}
  }
  window.scrollTo(0,0);
}
addEventListener('hashchange',render);

// ---- recherche ----
var box=document.getElementById('q');var out=document.getElementById('results');var navEl=document.getElementById('chapters');
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');}
box.addEventListener('input',function(){
  var q=norm(box.value.trim());
  if(q.length<2){out.innerHTML='';out.hidden=true;navEl.hidden=false;return;}
  navEl.hidden=true;out.hidden=false;
  var hits=[];
  D.order.forEach(function(id){
    var p=D.pages[id];var t=norm(p.title),x=norm(p.text);
    var score=t.indexOf(q)>=0?0:x.indexOf(q)>=0?1:-1;
    if(score<0){
      var hh=p.headings.filter(function(h){return norm(h.text).indexOf(q)>=0;});
      if(hh.length){hits.push({id:id,p:p,score:1,anchor:hh[0].id,ex:hh[0].text});return;}
      return;
    }
    var pos=x.indexOf(q);var ex=pos>=0?p.text.slice(Math.max(0,pos-45),pos+70):'';
    hits.push({id:id,p:p,score:score,anchor:null,ex:ex});
  });
  hits.sort(function(a,b){return a.score-b.score;});
  out.innerHTML=hits.length?hits.slice(0,25).map(function(h){
    return '<li><a href="#/'+h.id+(h.anchor?'?a='+encodeURIComponent(h.anchor):'')+'">'+h.p.title+
      '<span class="cat">'+h.p.chapter+'</span>'+(h.ex?'<span class="ex">…'+h.ex.replace(/[<>&]/g,'')+'…</span>':'')+'</a></li>';
  }).join(''):'<li><span class="cat">Aucun résultat.</span></li>';
});
out.addEventListener('click',function(){box.value='';out.hidden=true;out.innerHTML='';navEl.hidden=false;});

// ---- accordéons ----
document.querySelectorAll('.chapter>button').forEach(function(b){
  b.onclick=function(){
    var ch=b.parentElement;var open=ch.getAttribute('open-state')==='1';
    ch.setAttribute('open-state',open?'0':'1');
    b.setAttribute('aria-expanded',String(!open));
    ch.querySelector('ul').style.display=open?'none':'';
  };
});
render();
})();
`;

const navHtml = nav
  .map(
    (c, ci) => `
<div class="chapter" open-state="${ci === 0 ? 1 : 0}">
  <button type="button" aria-expanded="${ci === 0}"><span aria-hidden="true">${c.icon}</span><span>${esc(c.title)}</span><span class="count">${c.pages.length}</span><span class="chev" aria-hidden="true">▾</span></button>
  <ul${ci === 0 ? '' : ' style="display:none"'}>
    ${c.pages.map((p) => `<li><a href="#/${p.id}" data-id="${esc(p.id)}">${esc(p.title)}</a></li>`).join('\n    ')}
  </ul>
</div>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Documentation Digestor</title>
<meta name="description" content="Documentation complète de Digestor : journal alimentaire et suivi des symptômes (candidose, SIBO, SII). PWA 100 % hors-ligne, données locales.">
<meta name="robots" content="index,follow">
<link rel="icon" href="/favicon.svg">
<style>${CSS}</style>
</head>
<body>
<header class="top">
  <div class="top-in">
    <div class="brand">Documentation Digestor<small>App ${esc(APP_VERSION)} · Doc ${esc(DOC_VERSION)}</small></div>
    <div class="spacer"></div>
    <button class="icon-btn" id="menu-toggle" type="button" aria-label="Sommaire">☰ Sommaire</button>
    <button class="icon-btn" id="theme" type="button" aria-label="Changer de thème">◐ Thème</button>
    <a class="icon-btn" href="/" aria-label="Ouvrir l'application">↩ L'app</a>
  </div>
</header>

<div class="layout">
  <nav class="toc" id="toc" aria-label="Sommaire de la documentation">
    <input class="search" id="q" type="search" placeholder="Rechercher (2 lettres min.)…" aria-label="Rechercher dans la documentation">
    <ul class="results" id="results" hidden></ul>
    <div id="chapters">
${navHtml}
    </div>
  </nav>

  <main>
    <p class="crumb" id="crumb"></p>
    <article id="content"></article>
    <div class="pager" id="pager"></div>
  </main>
</div>

<footer class="doc">
  Digestor ${esc(APP_VERSION)} — documentation ${esc(DOC_VERSION)}, générée depuis <code>docs/</code>.
  Outil de suivi, <strong>pas un dispositif de diagnostic</strong> :
  consultez un médecin pour toute interprétation.
</footer>

<script>window.__DOCS__=${JSON.stringify(data).replace(/</g, '\\u003c')};</script>
<script>${JS}</script>
</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html, 'utf8');
console.log(
  `✓ Documentation générée : public/docs/index.html (${pages.length} pages, ${(html.length / 1024).toFixed(0)} kB)`,
);
