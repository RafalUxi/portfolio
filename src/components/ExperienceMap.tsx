import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath, geoContains } from "d3-geo";
import { FaLocationDot, FaAward } from "react-icons/fa6";
import type { Feature, FeatureCollection } from "geojson";
import type { Lang } from "./TopNav";
import plDeData from "../data/pl-de.json";

const PLDE = plDeData as unknown as FeatureCollection;

const PAD = 16;
const STEP = 11;
const DOT_R = 1.5;

const FILL: Record<string, string> = { "616": "#16324c", "276": "#122a41" };
const FILL_HOVER: Record<string, string> = { "616": "#1a3a58", "276": "#16324d" };
const STROKE = "#5b84b5";
const STROKE_HOVER = "#6f97c7";

const TITLE: Record<Lang, string> = { pl: "Doświadczenie", en: "Experience" };
const COUNTRY: Record<"PL" | "DE", Record<Lang, string>> = {
  PL: { pl: "Polska", en: "Poland" },
  DE: { pl: "Niemcy", en: "Germany" },
};

type L = Record<Lang, string>;
const t = (pl: string, en: string): L => ({ pl, en });
const d = (s: string): L => ({ pl: s, en: s });

type Entry = { title: L; org: L; period: L; highlight?: boolean };
type Point = { id: string; city: L; country: "PL" | "DE"; lat: number; lng: number; entries: Entry[] };
const POINTS: Point[] = [
  {
    id: "czestochowa",
    city: d("Częstochowa"),
    country: "PL",
    lat: 50.81,
    lng: 19.12,
    entries: [{ title: t("Praktyki studenckie (druk 3D)", "Internship (3D printing)"), org: d("Art-Press"), period: t("8 lip – 2 sie 2024", "8 Jul – 2 Aug 2024") }],
  },
  {
    id: "drezno",
    city: t("Drezno", "Dresden"),
    country: "DE",
    lat: 51.05,
    lng: 13.74,
    entries: [{ title: t("Praktyki studenckie (druk 3D)", "Work placement (3D printing)"), org: d("Tadam3d"), period: t("6–10 paź 2025", "6–10 Oct 2025") }],
  },
  {
    id: "wroclaw",
    city: d("Wrocław"),
    country: "PL",
    lat: 51.11,
    lng: 17.03,
    entries: [
      { title: t("Elektronika i Telekomunikacja (inż.)", "Electronics and Telecommunications (BEng)"), org: t("Politechnika Wrocławska", "Wrocław Tech"), period: t("paź 2021 – sty 2025", "Oct 2021 – Jan 2025") },
      { title: t("Elektroniczne Systemy Mechatroniki (mgr)", "Electronic Mechatronic Systems (MSc)"), org: t("Politechnika Wrocławska", "Wrocław Tech"), period: t("mar 2025 – lip 2026", "Mar 2025 – Jul 2026") },
      { title: t("Publikacja naukowa (Konferencja)", "Conference paper"), org: d("Eurosensors 2025"), period: t("7–10 wrz 2025", "7–10 Sep 2025"), highlight: true },
    ],
  },
];

export function ExperienceMap({ className = "", lang }: { className?: string; lang: Lang }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) {
        timer = setTimeout(measure, 120);
        return;
      }
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  const geo = useMemo(() => {
    if (!size) return null;
    const { w, h } = size;
    const proj = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [w - PAD, h - PAD],
      ],
      PLDE,
    );
    const path = geoPath(proj);
    const countries = PLDE.features.map((f) => ({ id: String(f.id), d: path(f as Feature) ?? "" }));
    const dots: { x: number; y: number }[] = [];
    for (let x = PAD; x <= w - PAD; x += STEP) {
      for (let y = PAD; y <= h - PAD; y += STEP) {
        const ll = proj.invert?.([x, y]);
        if (ll && geoContains(PLDE, ll)) dots.push({ x, y });
      }
    }
    const markers = POINTS.map((p) => {
      const xy = proj([p.lng, p.lat]) ?? [0, 0];
      return { ...p, x: xy[0], y: xy[1] };
    });
    return { w, h, countries, dots, markers };
  }, [size]);

  const activeId = hovered ?? selected;
  const activePoint = POINTS.find((p) => p.id === activeId) ?? null;

  return (
    <section className={`border-line bg-surface relative min-h-40 overflow-hidden rounded-2xl border md:min-h-0 ${className}`}>
      <h2 className="text-muted pointer-events-none absolute top-3 left-4 z-10 text-sm font-medium">{TITLE[lang]}</h2>

      <div ref={wrapRef} className="absolute inset-0">
        {geo && (
          <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} className="block" onClick={() => setSelected(null)}>
            {geo.countries.map((c) => (
              <path key={`f-${c.id}`} d={c.d} fill={(hoverCountry === c.id ? FILL_HOVER[c.id] : FILL[c.id]) ?? "#122a41"} className="transition-[fill] duration-200" />
            ))}
            {geo.dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={DOT_R} fill="#4e6f9c" />
            ))}
            {geo.countries.map((c) => (
              <path key={`s-${c.id}`} d={c.d} fill="none" stroke={hoverCountry === c.id ? STROKE_HOVER : STROKE} strokeWidth={hoverCountry === c.id ? 1.7 : 1.4} strokeLinejoin="round" className="transition-all duration-200" />
            ))}
            {geo.countries.map((c) => (
              <path key={`h-${c.id}`} d={c.d} fill="transparent" style={{ pointerEvents: "all" }} onMouseEnter={() => setHoverCountry(c.id)} onMouseLeave={() => setHoverCountry(null)} />
            ))}
            {geo.markers.map((m) => {
              const active = activeId === m.id;
              const isSel = selected === m.id;
              const toggle = () => setSelected((s) => (s === m.id ? null : m.id));
              return (
                <g
                  key={m.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSel}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(m.id)}
                  onBlur={() => setHovered(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle();
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <circle cx={m.x} cy={m.y} r={4} fill="none" stroke="#f59e0b" strokeWidth={1.5}>
                    <animate attributeName="r" values="4;13" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={m.x} cy={m.y} r={10} fill="#f59e0b" fillOpacity={active ? 0.4 : 0.18} />
                  {isSel && <circle cx={m.x} cy={m.y} r={8} fill="none" stroke="#fff" strokeWidth={1.5} />}
                  <circle cx={m.x} cy={m.y} r={active ? 5 : 4} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {activePoint && (
        <div className="border-line bg-base/95 pointer-events-none absolute bottom-3 left-1/2 z-20 w-[calc(100%-1.5rem)] max-w-xs -translate-x-1/2 rounded-2xl border p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2">
            <FaLocationDot aria-hidden className="shrink-0 text-[#f59e0b]" />
            <span className="text-fg text-sm font-semibold">
              {activePoint.city[lang]}, {COUNTRY[activePoint.country][lang]}
            </span>
          </div>
          <hr className="border-line my-3" />
          <ul className="space-y-3">
            {activePoint.entries.map((e, i) => {
              const org = e.org[lang];
              const period = e.period[lang];
              return (
                <li key={i} className={e.highlight ? "-mx-2 rounded-lg bg-[#f59e0b]/10 px-2 py-1.5 ring-1 ring-[#f59e0b]/30" : ""}>
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${e.highlight ? "text-[#f59e0b]" : "text-fg"}`}>
                    {e.highlight && <FaAward aria-hidden className="shrink-0" />}
                    {e.title[lang]}
                  </div>
                  {(org || period) && (
                    <div className="text-muted text-xs">
                      {org}
                      {org && period ? " | " : ""}
                      {period}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
