import { FaGlobe } from "react-icons/fa6";

export type View = "dashboard" | "project";
export type Lang = "pl" | "en";

const TABS: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "project", label: "Project" },
];

export function TopNav({ view, onChange, lang, onToggleLang }: { view: View; onChange: (v: View) => void; lang: Lang; onToggleLang: () => void }) {
  return (
    <header className="border-line bg-base/80 sticky top-0 z-40 border-b backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
        <div role="tablist" className="border-line bg-surface flex gap-1 rounded-full border p-1">
          {TABS.map(({ id, label }) => (
            <button key={id} role="tab" aria-selected={view === id} onClick={() => onChange(id)} className={`rounded-full px-5 py-1.5 text-sm transition-colors ${view === id ? "bg-fg text-base" : "text-muted hover:text-fg"}`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <button onClick={onToggleLang} aria-label={lang === "pl" ? "Przełącz na angielski" : "Switch to Polish"} className="border-line bg-surface text-muted absolute top-1/2 right-10 flex -translate-y-1/2 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:text-white">
        <FaGlobe aria-hidden />
        <span className="font-medium">{lang.toUpperCase()}</span>
      </button>
    </header>
  );
}
