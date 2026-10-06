import { useLayoutEffect, useMemo, useRef } from "react";
import { Bodies, Body, Composite, Engine, Events, Mouse, MouseConstraint, Runner } from "matter-js";
import type { Lang } from "./TopNav";

type Size = "lg" | "sm" | "xs";

const SIZE: Record<Size, string> = {
  lg: "px-4 py-1.5 text-sm md:px-6 md:py-2 md:text-base",
  sm: "px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm",
  xs: "px-2 py-0.5 text-[10px] md:px-2.5 md:py-1 md:text-xs",
};

const GROUPS: { legend: Record<Lang, string>; size: Size; tiles: { name: string; color: string; main?: boolean; text?: string }[] }[] = [
  {
    legend: { pl: "Dev stack", en: "Dev stack" },
    size: "lg",
    tiles: [
      { name: "React", color: "#38BDF8", main: true },
      { name: "TypeScript", color: "#38BDF8", main: true },
      { name: "Next.js", color: "#38BDF8", main: true },
      { name: "Tailwind", color: "#38BDF8", text: "#ffffff" },
      { name: "React Three Fiber", color: "#A855F7", main: true },
      { name: "Three.js", color: "#A855F7", main: true },
      { name: "Blender", color: "#A855F7" },
      { name: "Node.js", color: "#22C55E", main: true },
      { name: "NestJS", color: "#22C55E", main: true },
      { name: "MQTT", color: "#22C55E" },
      { name: "Socket.IO", color: "#22C55E" },
      { name: "PostgreSQL", color: "#6366F1" },
      { name: "TimescaleDB", color: "#6366F1" },
      { name: "Redis", color: "#6366F1" },
      { name: "Supabase", color: "#6366F1" },
      { name: "Docker", color: "#F97316" },
      { name: "Git", color: "#F97316" },
    ],
  },
  { legend: { pl: "Elektronika", en: "Electronics" }, size: "sm", tiles: ["ESP32", "LTspice", "Inventor", "Eagle"].map((name) => ({ name, color: "#14B8A6" })) },
  { legend: { pl: "Warstwa kreatywna", en: "Creative layer" }, size: "xs", tiles: ["DaVinci Resolve", "Affinity", "Unity", "Aseprite"].map((name) => ({ name, color: "#EC4899" })) },
];

const TILES = GROUPS.flatMap((g) => g.tiles.map((t) => ({ name: t.name, color: t.color, size: g.size, main: t.main ?? false, text: t.text ?? (t.main ? "#ffffff" : textOn(t.color)) })));

const MAIN_RING = "#FFFFFF";
const shadowFor = (main: boolean) => (main ? `0 0 0 2px ${MAIN_RING}, 0 4px 10px rgba(0,0,0,0.35)` : "0 4px 10px rgba(0,0,0,0.35)");

function textOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#0b0b0d" : "#ffffff";
}

const WALL = 200;
const PAD = 16;
// Odstęp między zrzutami — na tyle duży, żeby klocek zdążył usiąść, zanim
// spadnie następny, inaczej zderzają się w locie i rozjeżdżają stos.
const DROP_STAGGER_MS = 110;
// Tłumienie obrotu w fazie wsypywania: mnożnik prędkości kątowej na klatkę
// i czas, po którym znika (liczony od ostatniego zrzutu).
const SPIN_DAMP = 0.1;
const SPIN_SETTLE_MS = 5000;

function buildWalls(w: number, h: number): Body[] {
  const o = { isStatic: true };
  return [
    Bodies.rectangle(w / 2, h - PAD + WALL / 2, w, WALL, o),
    Bodies.rectangle(w / 2, PAD - WALL / 2, w, WALL, o),
    Bodies.rectangle(PAD - WALL / 2, h / 2, WALL, h, o),
    Bodies.rectangle(w - PAD + WALL / 2, h / 2, WALL, h, o),
  ];
}

// StrictMode montuje efekt dwa razy — bez ręcznego zdjęcia listenerów Matter.Mouse zostają zdublowane
function detachMouse(mouse: Mouse) {
  const el = mouse.element as HTMLElement;
  const m = mouse as unknown as Record<string, EventListener>;
  for (const [ev, h] of [
    ["mousemove", m.mousemove],
    ["mousedown", m.mousedown],
    ["mouseup", m.mouseup],
    ["touchmove", m.mousemove],
    ["touchstart", m.mousedown],
    ["touchend", m.mouseup],
    ["wheel", m.mousewheel],
    ["mousewheel", m.mousewheel],
    ["DOMMouseScroll", m.mousewheel],
  ] as const) {
    el.removeEventListener(ev, h);
  }
}

export function Skills({ className = "", lang }: { className?: string; lang: Lang }) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useLayoutEffect(() => {
    if (reduced) return;
    const arena = arenaRef.current;
    if (!arena) return;

    let started = false;
    let engine: Engine;
    let runner: Runner;
    let mouse: Mouse;
    let sync: () => void;
    let walls: Body[] = [];
    const sizes: { w: number; h: number }[] = [];
    const bodies: Body[] = [];
    const spawn: { x: number; y: number }[] = [];
    const timeouts: number[] = [];
    let damping = true;
    const dampSpin = () => {
      if (!damping) return;
      for (const b of bodies) Body.setAngularVelocity(b, b.angularVelocity * SPIN_DAMP);
    };

    const start = (w: number, h: number) => {
      started = true;
      engine = Engine.create();
      engine.gravity.y = 1;
      const world = engine.world;

      TILES.forEach((_, i) => {
        const el = pillRefs.current[i]!;
        sizes[i] = { w: el.offsetWidth, h: el.offsetHeight };
      });
      let sideFlip = 0;
      TILES.forEach((t, i) => {
        const { w: bw, h: bh } = sizes[i];
        // Główny stack trzyma środkowe 40% toru, reszta leci w zewnętrzne pasy
        // naprzemiennie w lewo i w prawo.
        const span = Math.max(0, w - 2 * PAD - bw);
        const frac = t.main ? 0.3 + Math.random() * 0.4 : sideFlip++ % 2 === 0 ? Math.random() * 0.28 : 0.72 + Math.random() * 0.28;
        const x = PAD + bw / 2 + span * frac;
        spawn[i] = { x, y: PAD + bh / 2 + Math.random() * Math.max(1, (h - 2 * PAD) * 0.15) };
        // Zaokrąglenie musi zmieścić się w połowie krótszego boku, inaczej Matter
        // deformuje kształt kolizji — najniższe klocki mają tylko 19 px wysokości.
        const radius = Math.min(10, Math.min(bw, bh) / 2 - 1);
        bodies[i] = Bodies.rectangle(x, -500 - Math.random() * 200, bw, bh, { restitution: 0, friction: 0.8, frictionStatic: 1.2, frictionAir: 0.02, chamfer: { radius } });
      });

      walls = buildWalls(w, h);
      Composite.add(world, walls);

      mouse = Mouse.create(arena);
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
      Composite.add(world, mc);
      detachWheelOnly(mouse);

      // Fizyka działa od pierwszej klatki — klocki mają normalną bezwładność i od
      // razu reagują na mysz. Na czas wsypywania mocno tłumimy sam obrót, żeby
      // nie rozkręciły się przy lądowaniu i nie stawały na sztorc; po SPIN_SETTLE_MS
      // tłumienie znika i stos da się rozwalić.
      Events.on(engine, "afterUpdate", dampSpin);
      const dampId = window.setTimeout(() => {
        damping = false;
      }, TILES.length * DROP_STAGGER_MS + SPIN_SETTLE_MS);
      timeouts.push(dampId);

      sync = () => {
        for (let i = 0; i < bodies.length; i++) {
          const el = pillRefs.current[i];
          if (!el) continue;
          const b = bodies[i];
          el.style.transform = `translate(${b.position.x - sizes[i].w / 2}px, ${b.position.y - sizes[i].h / 2}px) rotate(${b.angle}rad)`;
        }
      };
      Events.on(engine, "afterUpdate", sync);
      sync();

      runner = Runner.create();
      Runner.run(runner, engine);

      // Najszersze spadają pierwsze, więc lądują na dnie i tworzą podstawę;
      // najwęższe schodzą na końcu i siadają na wierzchu.
      const order = TILES.map((_, i) => i).sort((a, b) => sizes[b].w - sizes[a].w);
      order.forEach((idx, k) => {
        const id = window.setTimeout(() => {
          Body.setPosition(bodies[idx], spawn[idx]);
          Body.setVelocity(bodies[idx], { x: 0, y: 0 });
          Composite.add(world, bodies[idx]);
        }, k * DROP_STAGGER_MS);
        timeouts.push(id);
      });
    };

    // rAF-poll zamiast initial callbacku ResizeObservera — ten bywa niewiarygodny
    let raf = 0;
    const tryStart = () => {
      const w = arena.clientWidth;
      const h = arena.clientHeight;
      if (!w || !h) {
        raf = requestAnimationFrame(tryStart);
        return;
      }
      start(w, h);
    };
    tryStart();

    const ro = new ResizeObserver(() => {
      if (!started) return;
      const w = arena.clientWidth;
      const h = arena.clientHeight;
      if (!w || !h) return;
      Composite.remove(engine.world, walls);
      walls = buildWalls(w, h);
      Composite.add(engine.world, walls);
    });
    ro.observe(arena);

    return () => {
      cancelAnimationFrame(raf);
      timeouts.forEach((t) => clearTimeout(t));
      ro.disconnect();
      if (!started) return;
      Events.off(engine, "afterUpdate", sync);
      Events.off(engine, "afterUpdate", dampSpin);
      Runner.stop(runner);
      detachMouse(mouse);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [reduced]);

  return (
    <section className={`border-line bg-surface relative overflow-hidden rounded-2xl border ${className}`}>
      <h2 className="sr-only">Stack &amp; Skills</h2>

      <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-col gap-1.5 rounded-xl bg-black/40 px-3 py-2 backdrop-blur-sm">
        {GROUPS.map((g) => (
          <div key={g.legend.en} className="flex items-center gap-2">
            <span className="flex gap-0.5">
              {[...new Set(g.tiles.map((t) => t.color))].map((c) => (
                <span key={c} style={{ backgroundColor: c }} className={`rounded-full ${g.size === "lg" ? "h-2.5 w-2.5" : g.size === "sm" ? "h-2 w-2" : "h-1.5 w-1.5"}`} />
              ))}
            </span>
            <span className="text-xs font-medium text-white/85">{g.legend[lang]}</span>
          </div>
        ))}
      </div>

      {reduced ? (
        <div className="relative z-10 flex flex-wrap content-start gap-2 p-4">
          {TILES.map((tile) => (
            <span key={tile.name} style={{ backgroundColor: tile.color, color: tile.text, boxShadow: shadowFor(tile.main) }} className={`rounded-lg ${tile.main ? "font-bold" : "font-semibold"} ${SIZE[tile.size]}`}>
              {tile.name}
            </span>
          ))}
        </div>
      ) : (
        <div ref={arenaRef} className="absolute inset-0 z-10 overflow-hidden">
          {TILES.map((tile, i) => (
            <div
              key={tile.name}
              ref={(el) => {
                pillRefs.current[i] = el;
              }}
              style={{ backgroundColor: tile.color, color: tile.text, boxShadow: shadowFor(tile.main) }}
              className={`absolute top-0 left-0 cursor-grab rounded-lg whitespace-nowrap will-change-transform select-none active:cursor-grabbing ${tile.main ? "font-bold" : "font-semibold"} ${SIZE[tile.size]}`}
            >
              {tile.name}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function detachWheelOnly(mouse: Mouse) {
  const el = mouse.element as HTMLElement;
  const m = mouse as unknown as Record<string, EventListener>;
  el.removeEventListener("wheel", m.mousewheel);
  el.removeEventListener("mousewheel", m.mousewheel);
  el.removeEventListener("DOMMouseScroll", m.mousewheel);
}
