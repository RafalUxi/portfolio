import type { ReactNode } from "react";
import { Profil } from "./Profil";
import { Skills } from "./Skills";
import type { Lang } from "./TopNav";
import type { IconType } from "react-icons";
import { FaGithub, FaYoutube, FaInstagram, FaLinkedin, FaTiktok, FaEnvelope } from "react-icons/fa6";

function Box({ title, className = "" }: { title: string; className?: string }) {
  return (
    <section className={`border-line bg-surface flex min-h-40 flex-col overflow-hidden rounded-2xl border p-4 md:min-h-0 ${className}`}>
      <h2 className="text-fg text-sm font-medium">{title}</h2>
      <div className="text-muted mt-auto text-xs">placeholder</div>
    </section>
  );
}

// href puste = miejsce na link. Wklej między cudzysłowy.
const SOCIALS: { name: string; Icon: IconType; href: string }[] = [
  { name: "LinkedIn", Icon: FaLinkedin, href: "https://www.linkedin.com/in/rafa%C5%82-trzeciakowski-2015b4419/" },
  { name: "GitHub", Icon: FaGithub, href: "https://github.com/RafalUxi" },
  { name: "Mail", Icon: FaEnvelope, href: "mailto:rafal.trzeciakowski7@gmail.com" },
  { name: "Instagram", Icon: FaInstagram, href: "https://www.instagram.com/uxi_dev/" },
  { name: "YouTube", Icon: FaYoutube, href: "https://www.youtube.com/@Uxi_dev" },
  { name: "TikTok", Icon: FaTiktok, href: "" },
];

export function Dashboard({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:h-full md:grid-cols-12 md:grid-rows-12">
      <Profil lang={lang} className="md:col-span-3 md:col-start-1 md:row-span-12 md:row-start-1" />
      <Box title="Mapa — doświadczenie (nauka + praktyki)" className="md:col-span-5 md:col-start-4 md:row-span-7 md:row-start-6" />
      <section className="grid grid-cols-3 gap-4 md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-1 md:h-full md:grid-rows-2">
        {SOCIALS.map(({ name, Icon, href }) => (
          <a key={name} href={href} aria-label={name} target="_blank" rel="noreferrer" className="border-line bg-surface group flex aspect-square items-center justify-center rounded-2xl border text-xs md:aspect-auto">
            <Icon aria-hidden className="h-3/5 w-3/5 text-violet-100 group-hover:text-violet-300" />
          </a>
        ))}
      </section>

      <Skills className="md:col-span-5 md:col-start-4 md:row-span-5 md:row-start-1" />
      <Box title="Gra — Jump King" className="md:col-span-4 md:col-start-9 md:row-span-7 md:row-start-6" />
    </div>
  );
}

export function ProjectView(): ReactNode {
  return <div className="border-line text-muted rounded-2xl border border-dashed p-16 text-center">Project — do rozpisania (etap 5)</div>;
}
