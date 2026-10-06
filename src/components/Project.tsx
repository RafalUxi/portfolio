import { useEffect, useState } from "react";
import { FaGithub, FaArrowUpRightFromSquare, FaChevronDown, FaFilePdf, FaDownload } from "react-icons/fa6";
import type { Lang } from "./TopNav";
import { PROJECTS, groupProjects, type Project, type Shot, type Status } from "../data/projects";
import { colorFor } from "../data/stack";

const T = {
  explorer: { pl: "Projekty", en: "Projects" },
  code: { pl: "Kod", en: "Code" },
  preview: { pl: "Podgląd — gif / screen", en: "Preview — gif / screenshot" },
  playNow: { pl: "Zagraj online", en: "Play online" },
  downloadDoc: { pl: "Pobierz dokumentację", en: "Download documentation" },
  readme: { pl: "Pełny opis w README na GitHubie", en: "Full write-up in the README on GitHub" },
} satisfies Record<string, Record<Lang, string>>;

const STATUS: Record<Status, { label: string; color: string }> = {
  shipped: { label: "Shipped", color: "#27c93f" },
  wip: { label: "WIP", color: "#ffbd2e" },
  concept: { label: "Design", color: "#8a8a94" },
};

const DESKTOP = "(min-width: 768px)";
const ROTATE_MS = 4000;
const COVER_ROTATE_MS = 7000;
const FADE_MS = 700;

const GROUPS = groupProjects(PROJECTS);

function useIsDesktop(): boolean {
  const [is, setIs] = useState(() => window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = () => setIs(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return is;
}

function initialSlug(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("project");
  return PROJECTS.some((p) => p.slug === fromUrl) ? fromUrl! : PROJECTS[0].slug;
}

export function ProjectView({ lang }: { lang: Lang }) {
  const [slug, setSlug] = useState(initialSlug);
  const isDesktop = useIsDesktop();
  const selected = PROJECTS.find((p) => p.slug === slug) ?? PROJECTS[0];

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("project", slug);
    window.history.replaceState(null, "", url);
  }, [slug]);

  // Desktop i mobile renderują się rozłącznie, nie przez ukrywanie CSS-em —
  // inaczej ten sam projekt montowałby się dwa razy.
  if (isDesktop) {
    return (
      <div className="grid h-full grid-cols-[minmax(190px,240px)_1fr] gap-6">
        <div className="h-full">
          <Tree slug={slug} onSelect={setSlug} lang={lang} />
        </div>
        <div className="flex h-full min-h-0 flex-col">
          <ProjectDetail project={selected} lang={lang} fill />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      {PROJECTS.map((p) => {
        const open = p.slug === slug;
        return (
          <article key={p.slug} className="border-line bg-surface overflow-hidden rounded-2xl border">
            <button onClick={() => setSlug(p.slug)} aria-expanded={open} className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.stack[0]) }} />
              <span className="text-fg flex-1 text-sm font-medium">{p.title}</span>
              <StatusBadge status={p.status} />
              <FaChevronDown aria-hidden className={`text-muted shrink-0 text-xs transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="border-line border-t p-4">
                <ProjectDetail project={p} lang={lang} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Tree({ slug, onSelect, lang }: { slug: string; onSelect: (s: string) => void; lang: Lang }) {
  return (
    <nav aria-label={T.explorer[lang]} className="border-line bg-surface rounded-2xl border p-3">
      <p className="text-muted px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase">{T.explorer[lang]}</p>
      {GROUPS.map(({ category, items }) => (
        <div key={category} className="mb-1">
          <p className="text-muted px-2 py-1 font-mono text-xs">{category}/</p>
          <ul>
            {items.map((p) => {
              const active = p.slug === slug;
              return (
                <li key={p.slug}>
                  <button onClick={() => onSelect(p.slug)} aria-current={active} className={`flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 pl-4 text-left font-mono text-xs transition-colors ${active ? "bg-fg/10 text-fg" : "text-muted hover:text-fg"}`}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.stack[0]) }} />
                    <span className="flex-1 truncate">{p.file}</span>
                    <StatusBadge status={p.status} compact />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function StatusBadge({ status, compact = false }: { status: Status; compact?: boolean }) {
  const { label, color } = STATUS[status];
  return (
    <span style={{ color, borderColor: `${color}66` }} className={`shrink-0 rounded-full border font-medium ${compact ? "px-1.5 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}>
      {label}
    </span>
  );
}

function ProjectDetail({ project, lang, fill = false }: { project: Project; lang: Lang; fill?: boolean }) {
  const { live, code, readme, pdf } = project.links;
  return (
    <div className={`flex flex-col gap-3 ${fill ? "h-full min-h-0" : ""}`}>
      <Preview project={project} lang={lang} fill={fill} />

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <h1 className="text-fg text-xl font-semibold">{project.title}</h1>
        <StatusBadge status={project.status} />
      </div>

      {/* lang na akapicie przełącza słownik dzielenia wyrazów razem z językiem */}
      <p lang={lang} className="text-fg shrink-0 text-sm hyphens-auto text-justify">
        {project.blurb[lang]}
      </p>
      <p lang={lang} className="text-muted shrink-0 text-sm leading-relaxed hyphens-auto text-justify">
        {project.decisions[lang]}
      </p>

      {readme && (
        <a href={readme} target="_blank" rel="noreferrer" className="text-muted hover:text-fg shrink-0 self-start text-xs underline underline-offset-2 transition-colors">
          {T.readme[lang]}
        </a>
      )}

      {live && (
        <div className="border-line bg-surface shrink-0 overflow-hidden rounded-xl border transition-colors hover:border-[#27c93f]/40">
          <a href={live} target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-3 py-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#27c93f] opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-fg block text-sm font-medium">{(project.liveLabel ?? T.playNow)[lang]}</span>
              <span className="text-muted block truncate font-mono text-xs">{live.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
            </span>
            <FaArrowUpRightFromSquare aria-hidden className="text-muted group-hover:text-fg shrink-0 text-sm transition-colors" />
          </a>
          {project.warning && <p className="border-line text-muted border-t px-3 py-2 text-[11px] leading-snug">{project.warning[lang]}</p>}
        </div>
      )}

      {pdf && (
        // download wymusza czytelną nazwę — w buildzie plik ma hash w nazwie
        <a href={pdf} download={`${project.slug}.pdf`} className="border-line bg-surface hover:border-[#14B8A6]/50 group flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors">
          <FaFilePdf aria-hidden className="shrink-0 text-base text-[#14B8A6]" />
          <span className="min-w-0 flex-1">
            <span className="text-fg block text-sm font-medium">{T.downloadDoc[lang]}</span>
            <span className="text-muted block truncate font-mono text-xs">{project.slug}.pdf</span>
          </span>
          <FaDownload aria-hidden className="text-muted group-hover:text-fg shrink-0 text-sm transition-colors" />
        </a>
      )}

      <ul className="flex shrink-0 flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li key={tech} className="border-line text-fg flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorFor(tech) }} />
            {tech}
          </li>
        ))}
      </ul>

      {code && (
        <a href={code} target="_blank" rel="noreferrer" className="border-line text-muted hover:text-fg flex shrink-0 items-center gap-1.5 self-start rounded-full border px-4 py-1.5 text-sm transition-colors">
          <FaGithub aria-hidden /> {T.code[lang]}
        </a>
      )}
    </div>
  );
}

function Preview({ project, lang, fill }: { project: Project; lang: Lang; fill: boolean }) {
  const box = fill ? "min-h-0 flex-1" : "aspect-video";

  if ((project.video || project.covers?.length) && project.media.length > 0) {
    return <MediaBento project={project} lang={lang} fill={fill} />;
  }
  if (project.media[0]) {
    return <img src={project.media[0].src} alt={project.media[0].alt[lang]} className={`border-line w-full rounded-xl border object-contain ${box}`} />;
  }
  return <div className={`border-line text-muted flex items-center justify-center rounded-xl border border-dashed bg-[#0d0d0f] text-sm ${box}`}>{T.preview[lang]}</div>;
}

function MediaBento({ project, lang, fill }: { project: Project; lang: Lang; fill: boolean }) {
  const tile = `border-line min-h-0 overflow-hidden rounded-xl border bg-[#0d0d0f] ${fill ? "" : "aspect-[4/3]"}`;
  const grid = fill ? "min-h-0 flex-1 grid-cols-2 grid-rows-1" : "grid-cols-1";

  // Jeden licznik na oba kafle — dwa osobne interwały o równym okresie się rozjeżdżają
  const sync = project.syncMs ?? 0;
  const synced = useRotation(Math.max(project.covers?.length ?? 0, project.media.length), sync, sync > 0);
  const sharedIndex = sync > 0 ? synced : undefined;

  return (
    <div className={`grid gap-2 ${grid}`}>
      {project.video ? (
        <video src={project.video} className={`h-full w-full object-cover ${tile}`} autoPlay muted loop playsInline preload="metadata" aria-label={project.title} />
      ) : (
        <ShotRotator shots={project.covers ?? []} lang={lang} className={tile} intervalMs={COVER_ROTATE_MS} imgClass={project.coversClass ?? "object-contain"} index={sharedIndex} />
      )}
      <ShotRotator shots={project.media} lang={lang} className={tile} intervalMs={ROTATE_MS} imgClass={project.mediaClass ?? "object-cover"} index={sharedIndex} />
    </div>
  );
}

function useRotation(count: number, intervalMs: number, enabled: boolean): number {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!enabled || count < 2 || intervalMs <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [enabled, count, intervalMs]);

  return i;
}

// Zdjęcia leżą na sobie i przełączają się przezroczystością — podmiana src
// mrugałaby pustym kadrem, zanim nowy plik się zdekoduje.
function ShotRotator({ shots, lang, className, intervalMs, imgClass, index }: { shots: Shot[]; lang: Lang; className: string; intervalMs: number; imgClass: string; index?: number }) {
  const own = useRotation(shots.length, intervalMs, index === undefined);
  const i = (index ?? own) % Math.max(1, shots.length);

  return (
    <div className={`relative ${className}`}>
      {shots.map((shot, k) => (
        <a
          key={shot.src}
          href={shot.src}
          target="_blank"
          rel="noreferrer"
          aria-hidden={k !== i}
          tabIndex={k === i ? 0 : -1}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={`absolute inset-0 cursor-zoom-in transition-opacity ease-in-out ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <img src={shot.src} alt={shot.alt[lang]} className={`h-full w-full ${imgClass}`} />
        </a>
      ))}
    </div>
  );
}
