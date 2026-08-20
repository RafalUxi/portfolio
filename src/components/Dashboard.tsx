import type { ReactNode } from "react";

function Box({ title, className = "" }: { title: string; className?: string }) {
  return (
    <section className={`border-line bg-surface flex min-h-40 flex-col overflow-hidden rounded-2xl border p-4 md:min-h-0 ${className}`}>
      <h2 className="text-fg text-sm font-medium">{title}</h2>
      <div className="text-muted mt-auto text-xs">placeholder</div>
    </section>
  );
}

const SOCIALS = ["LinkedIn", "GitHub", "Mail", "TikTok", "YouTube", "Instagram"];

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 md:h-full md:grid-cols-12 md:grid-rows-12">
      <Box title="Profil" className="md:col-span-3 md:col-start-1 md:row-span-12 md:row-start-1" />
      <Box title="Mapa — doświadczenie (nauka + praktyki)" className="md:col-span-5 md:col-start-4 md:row-span-7 md:row-start-6" />
      <section className="grid grid-cols-3 gap-4 md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-1 md:h-full md:grid-rows-2">
        {SOCIALS.map((name) => (
          <div key={name} className="border-line bg-surface text-muted flex aspect-square items-center justify-center rounded-2xl border text-xs md:aspect-auto">
            {name}
          </div>
        ))}
      </section>

      <Box title="Stack / Skills" className="md:col-span-5 md:col-start-4 md:row-span-5 md:row-start-1" />
      <Box title="Gra — Jump King" className="md:col-span-4 md:col-start-9 md:row-span-7 md:row-start-6" />
    </div>
  );
}

export function ProjectView(): ReactNode {
  return <div className="border-line text-muted rounded-2xl border border-dashed p-16 text-center">Project — do rozpisania (etap 5)</div>;
}
