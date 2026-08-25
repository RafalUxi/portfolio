import { Profil } from "./Profil";
import { Skills } from "./Skills";
import { ExperienceMap } from "./ExperienceMap";
import { JumpKing } from "./JumpKing";
import type { Lang } from "./TopNav";
import type { IconType } from "react-icons";
import { FaGithub, FaYoutube, FaInstagram, FaLinkedin, FaTiktok, FaEnvelope } from "react-icons/fa6";

const SOCIALS: { name: string; Icon: IconType; href: string }[] = [
  { name: "LinkedIn", Icon: FaLinkedin, href: "https://www.linkedin.com/in/rafa%C5%82-trzeciakowski-2015b4419/" },
  { name: "GitHub", Icon: FaGithub, href: "https://github.com/RafalUxi" },
  { name: "Mail", Icon: FaEnvelope, href: "mailto:rafal.trzeciakowski7@gmail.com" },
  { name: "Instagram", Icon: FaInstagram, href: "https://www.instagram.com/uxi_dev/" },
  { name: "YouTube", Icon: FaYoutube, href: "https://www.youtube.com/@Uxi_dev" },
  { name: "TikTok", Icon: FaTiktok, href: "https://www.tiktok.com/@uxi_dev" },
];

export function Dashboard({ lang }: { lang: Lang }) {
  return (
    <div className="bento grid grid-cols-1 gap-4 md:h-full md:grid-cols-12 md:grid-rows-12 md:gap-6">
      <Profil lang={lang} className="h-[540px] md:col-span-3 md:col-start-1 md:row-span-12 md:row-start-1 md:h-auto" />
      <ExperienceMap lang={lang} className="h-[380px] md:col-span-5 md:col-start-4 md:row-span-7 md:row-start-6 md:h-auto" />
      <Skills lang={lang} className="h-[340px] md:col-span-5 md:col-start-4 md:row-span-5 md:row-start-1 md:h-auto" />

      <section className="grid grid-cols-3 gap-3 md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-1 md:h-full md:grid-rows-2 md:gap-4">
        {SOCIALS.map(({ name, Icon, href }) => (
          <a key={name} href={href} aria-label={name} target="_blank" rel="noreferrer" className="border-line bg-surface group flex aspect-square items-center justify-center rounded-2xl border text-xs md:aspect-auto">
            <Icon aria-hidden className="h-3/5 w-3/5 text-violet-100 group-hover:text-violet-300" />
          </a>
        ))}
      </section>
      <JumpKing lang={lang} className="h-[320px] md:col-span-4 md:col-start-9 md:row-span-7 md:row-start-6 md:h-auto" />
    </div>
  );
}
