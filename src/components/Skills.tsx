import { useLayoutEffect, useMemo, useRef } from "react";
import { Bodies, Composite, Engine, Events, Mouse, MouseConstraint, Runner, type Body } from "matter-js";

// Finalną listę poda Rafał — łatwo edytować tutaj.
const TECHS = ["React", "React Three Fiber", "Three.js", "Node.js", "Socket.IO", "TypeScript", "PostgreSQL", "Supabase", "Tailwind", "Git", "Blender", "Spring Boot"];

// Każdy klocek inny kolor (paleta brand-inspired, indeks = pozycja w TECHS).
const COLORS = ["#61DAFB", "#A855F7", "#F472B6", "#5FA04E", "#F59E0B", "#3178C6", "#4169E1", "#3ECF8E", "#38BDF8", "#F05032", "#EA7600", "#6DB33F"];

// Dobór koloru tekstu pod kontrast (jasne tło → ciemny tekst i odwrotnie).
function textOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#0b0b0d" : "#ffffff";
}

const WALL = 200; // grubość ścian (duża, żeby nic nie przeciekało przy rzucie)

// Podłoga + dwie wysokie ściany boczne. Sufit celowo otwarty: klocki wpadają
// z góry, a rzucone do góry wracają grawitacją (boki nie pozwalają uciec bokiem).
function buildWalls(w: number, h: number): Body[] {
  const opts = { isStatic: true };
  return [
    Bodies.rectangle(w / 2, h + WALL / 2, w + 2 * WALL, WALL, opts),
    Bodies.rectangle(-WALL / 2, h / 2, WALL, h + 6000, opts),
    Bodies.rectangle(w + WALL / 2, h / 2, WALL, h + 6000, opts),
  ];
}

// Matter.Mouse dokleja listenery do elementu; zdejmujemy je ręcznie przy cleanupie
// (StrictMode montuje efekt dwa razy — bez tego zostałyby zdublowane).
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

export function Skills({ className = "" }: { className?: string }) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useLayoutEffect(() => {
    if (reduced) return; // fallback = statyczne chipy, bez silnika
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

    const start = (w: number, h: number) => {
      started = true;
      engine = Engine.create();
      engine.gravity.y = 1;
      const world = engine.world;

      // Klocek = ciało o rozmiarze zmierzonego DOM-a; spawn nad kontenerem (rain-in).
      TECHS.forEach((_, i) => {
        const el = pillRefs.current[i]!;
        const bw = el.offsetWidth;
        const bh = el.offsetHeight;
        sizes[i] = { w: bw, h: bh };
        const x = bw / 2 + 6 + Math.random() * Math.max(1, w - bw - 12);
        const y = -20 - Math.random() * (TECHS.length * 34); // wyżej = wpada później
        bodies[i] = Bodies.rectangle(x, y, bw, bh, { restitution: 0.35, friction: 0.4, frictionAir: 0.02, chamfer: { radius: 10 } });
      });

      walls = buildWalls(w, h);
      Composite.add(world, [...walls, ...bodies]);

      mouse = Mouse.create(arena);
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
      Composite.add(world, mc);
      detachWheelOnly(mouse); // oddaj scroll kółkiem do Lenisa

      sync = () => {
        for (let i = 0; i < bodies.length; i++) {
          const el = pillRefs.current[i];
          if (!el) continue;
          const b = bodies[i];
          el.style.transform = `translate(${b.position.x - sizes[i].w / 2}px, ${b.position.y - sizes[i].h / 2}px) rotate(${b.angle}rad)`;
        }
      };
      Events.on(engine, "afterUpdate", sync);
      sync(); // pozycje startowe przed pierwszym paintem

      runner = Runner.create();
      Runner.run(runner, engine);
    };

    // Uruchom silnik gdy boks ma realny rozmiar (rAF-poll unika wyścigu z layoutem —
    // initial callback ResizeObservera bywa niewiarygodny w niektórych środowiskach).
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

    // Kolejne zmiany rozmiaru tylko przebudowują ściany — klocki zostają.
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
      ro.disconnect();
      if (!started) return;
      Events.off(engine, "afterUpdate", sync);
      Runner.stop(runner);
      detachMouse(mouse);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [reduced]);

  return (
    <section className={`border-line bg-surface flex min-h-40 flex-col overflow-hidden rounded-2xl border md:min-h-0 ${className}`}>
      <h2 className="text-fg p-4 pb-2 text-sm font-medium">Stack / Skills</h2>

      {reduced ? (
        <div className="flex flex-wrap content-start gap-2 p-4 pt-2">
          {TECHS.map((t, i) => (
            <span key={t} style={{ backgroundColor: COLORS[i % COLORS.length], color: textOn(COLORS[i % COLORS.length]) }} className="rounded-lg px-3 py-1.5 text-base font-semibold shadow-md">
              {t}
            </span>
          ))}
        </div>
      ) : (
        <div ref={arenaRef} className="relative min-h-0 flex-1 overflow-hidden">
          {TECHS.map((t, i) => (
            <div
              key={t}
              ref={(el) => {
                pillRefs.current[i] = el;
              }}
              style={{ backgroundColor: COLORS[i % COLORS.length], color: textOn(COLORS[i % COLORS.length]) }}
              className="absolute top-0 left-0 cursor-grab rounded-lg px-3 py-1.5 text-base font-semibold whitespace-nowrap shadow-md will-change-transform select-none active:cursor-grabbing"
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Zdejmij tylko listenery kółka (żeby Lenis mógł scrollować nad boksem).
function detachWheelOnly(mouse: Mouse) {
  const el = mouse.element as HTMLElement;
  const m = mouse as unknown as Record<string, EventListener>;
  el.removeEventListener("wheel", m.mousewheel);
  el.removeEventListener("mousewheel", m.mousewheel);
  el.removeEventListener("DOMMouseScroll", m.mousewheel);
}
