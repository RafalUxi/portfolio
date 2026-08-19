import type { ReactNode } from "react";

function Box({ title, className = "" }: { title: string; className?: string }) {
  return (
    <section className={`border-line bg-surface flex min-h-40 flex-col rounded-2xl border p-4 ${className}`}>
      <h2 className="text-fg text-sm font-medium">{title}</h2>
      <div className="text-muted mt-auto text-xs">placeholder</div>
    </section>
  );
}

const SOCIALS = ["YouTube", "Instagram", "GitHub", "LinkedIn", "Mail"];

/** Bento wg makiety 1.png: Profil (wysoki, lewa kolumna) | Mapa + Gra | Social + Skills. */
export function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Box title="Profil" className="md:col-span-3 md:row-span-2" />
      <Box title="Mapa — doświadczenie (nauka + praktyki)" className="md:col-span-5" />

      <section className="grid grid-cols-3 gap-4 md:col-span-4">
        {SOCIALS.map((name) => (
          <div key={name} className="border-line bg-surface text-muted flex aspect-square items-center justify-center rounded-2xl border text-xs">
            {name}
          </div>
        ))}
      </section>

      <Box title="Gra — Jump King" className="md:col-span-5 md:min-h-72" />
      <Box title="Stack / Skills" className="md:col-span-4 md:min-h-72" />
    </div>
  );
}

export function ProjectView(): ReactNode {
  return <div className="border-line text-muted rounded-2xl border border-dashed p-16 text-center">Project — do rozpisania (etap 5)</div>;
}
