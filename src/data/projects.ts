import type { Lang } from "../components/TopNav";
import platformaDashboard from "../projects/platforma/Dashboard.jpg";
import platformaEsp32 from "../projects/platforma/esp32.jpg";
import platformaEsp32Aht from "../projects/platforma/esp32-aht20.jpg";
import platformaAht from "../projects/platforma/aht20.jpg";
import monolitFilm from "../projects/monolit/monolitfilm.mp4";
import monolitEq from "../projects/monolit/eqmonolit.webp";
import monolitSklep from "../projects/monolit/sklepmonolit.webp";
import monolitKasyno from "../projects/monolit/kasynomonolit.webp";
import monolitCzat from "../projects/monolit/czatmonolit.webp";
import riftMenu from "../projects/skillrift/menu.png";
import riftMenu2 from "../projects/skillrift/menu2.png";
import riftMenu3 from "../projects/skillrift/menu3.png";
import rift1 from "../projects/skillrift/1.gif";
import rift2 from "../projects/skillrift/2.gif";
import rift3 from "../projects/skillrift/3.gif";
import rift4 from "../projects/skillrift/4.gif";
import loadDoc from "../projects/load-system/load-system.pdf";
import loadTor1 from "../projects/load-system/tor1.png";
import loadTor2 from "../projects/load-system/tor2.png";
import loadTor3 from "../projects/load-system/tor3.png";
import load1 from "../projects/load-system/1.png";
import load2 from "../projects/load-system/2.png";
import load3 from "../projects/load-system/3.png";
import ledDoc from "../projects/led-chaser/led-chaser.pdf";
import led1 from "../projects/led-chaser/1.png";
import led2 from "../projects/led-chaser/2.png";
import led3 from "../projects/led-chaser/3.png";
import ledBoard1 from "../projects/led-chaser/plytka1.png";
import ledBoard2 from "../projects/led-chaser/plytka2.png";
import ledBoard3 from "../projects/led-chaser/plytka3.png";

export type Status = "shipped" | "wip" | "concept";

export type Shot = { src: string; alt: Record<Lang, string> };

export type Project = {
  slug: string;
  category: string;
  file: string;
  title: string;
  blurb: Record<Lang, string>;
  decisions: Record<Lang, string>;
  stack: string[];
  links: { live?: string; code?: string; readme?: string; pdf?: string };
  liveLabel?: Record<Lang, string>;
  video?: string;
  covers?: Shot[];
  coversClass?: string;
  syncMs?: number;
  media: Shot[];
  mediaClass?: string;
  warning?: Record<Lang, string>;
  status: Status;
};

// Kolejność w tablicy = kolejność w drzewie; pierwszy jest domyślnie zaznaczony.
export const PROJECTS: Project[] = [
  {
    slug: "telemetry",
    category: "fullstack",
    file: "telemetry.ts",
    title: "Telemetry Platform",
    blurb: {
      pl: "Platforma telemetryczna: temperatura i wilgotność z ESP32 na moim biurku i z urządzeń symulowanych, przez MQTT do bazy szeregów czasowych i na dashboard.",
      en: "A telemetry platform carrying temperature and humidity from an ESP32 on my desk and from simulated devices, over MQTT into a time-series database and onto a dashboard.",
    },
    decisions: {
      pl: "Mosquitto to jedyne miejsce, którego dotyka urządzenie: każde dostaje własne konto z ACL na dokładnie jeden temat i przypięty client id, więc skradziony klucz pozwala pisać tylko jako to urządzenie. Proces ingest waliduje payload Zodem i wrzuca go na kolejkę, nie dotykając bazy — wolny zapis zapycha kolejkę, zamiast gubić wiadomości na brokerze, a duplikaty z QoS 1 zderzają się na kluczu głównym i są zliczane, nie traktowane jak błąd. Nad hypertable w TimescaleDB stoją agregaty godzinowe i dobowe, a zapytanie dobiera warstwę do długości okna, więc pełny rok wraca jako 365 wierszy zamiast 31 milionów, które za nimi stoją.",
      en: "Mosquitto is the only place a device touches: each one gets its own account with an ACL for exactly one topic and a pinned client id, so a stolen credential can write as that device and nothing else. The ingest process validates the payload with Zod and pushes it onto a queue without ever touching the database, so a slow write backs up the queue instead of losing messages at the broker, and QoS 1 duplicates collide on the primary key and get counted rather than treated as failures. Hourly and daily continuous aggregates sit above the TimescaleDB hypertable and a query picks its layer from the length of the window, so a full year comes back as 365 rows instead of the 31 million behind them.",
    },
    stack: ["ESP32", "MQTT", "Node.js", "TypeScript", "Redis", "TimescaleDB", "NestJS", "Next.js", "React", "Docker"],
    links: {
      live: "https://panel.rafaltrzeciakowski.dev",
      code: "https://github.com/RafalUxi/telemetry-platform",
    },
    liveLabel: { pl: "Otwórz panel", en: "Open the panel" },
    covers: [{ src: platformaDashboard, alt: { pl: "Dashboard platformy telemetrycznej", en: "Telemetry platform dashboard" } }],
    coversClass: "object-contain",
    media: [
      { src: platformaEsp32, alt: { pl: "Płytka ESP32", en: "ESP32 board" } },
      { src: platformaEsp32Aht, alt: { pl: "ESP32 podłączony do czujnika AHT20", en: "ESP32 wired to the AHT20 sensor" } },
      { src: platformaAht, alt: { pl: "Czujnik AHT20", en: "AHT20 sensor breakout" } },
    ],
    mediaClass: "object-contain md:brightness-[0.68]",
    warning: {
      pl: "Kliknij „Guest”, żeby wejść bez zakładania konta. Jedno z urządzeń na liście to ESP32 na moim biurku, reszta jest symulowana.",
      en: "Click “Guest” to look around without an account. One of the devices in the list is an ESP32 on my desk; the rest are simulated.",
    },
    status: "shipped",
  },
  {
    slug: "monolit",
    category: "fullstack",
    file: "monolit.tsx",
    title: "Monolit",
    blurb: {
      pl: "Monolit to przeglądarkowe MMO 3D w czasie rzeczywistym, bez pobierania czegokolwiek.",
      en: "Monolit is a real-time multiplayer 3D MMO that runs in the browser, with no download.",
    },
    decisions: {
      pl: "Napisałem je sam, od klienta po serwer: React Three Fiber i Rapier odpowiadają za renderowanie i fizykę, a serwer w Node trzyma całą logikę gry, losowość i operacje na ekonomii, więc przeglądarka nigdy nie decyduje o wyniku. Zmiany złota i ekwipunku idą w transakcjach PostgreSQL z blokadą wiersza, dzięki czemu dwuklik w „kup” nie zduplikuje przedmiotu.",
      en: 'I built it solo, from the client to the server: React Three Fiber and Rapier handle rendering and physics, while a Node server owns all game logic, randomness and economy operations, so the browser never decides outcomes. Gold and inventory changes run inside PostgreSQL transactions with row-level locking, which is what keeps a double-clicked "buy" from duplicating an item.',
    },
    stack: ["React", "TypeScript", "Tailwind", "React Three Fiber", "Three.js", "Node.js", "Socket.IO", "PostgreSQL", "Supabase"],
    links: {
      live: "https://mmo-sandbox-3d.vercel.app/",
      code: "https://github.com/RafalUxi/mmo-sandbox-3d",
      readme: "https://github.com/RafalUxi/mmo-sandbox-3d#readme",
    },
    video: monolitFilm,
    media: [
      { src: monolitEq, alt: { pl: "Ekwipunek postaci", en: "Character inventory" } },
      { src: monolitSklep, alt: { pl: "Sklep w grze", en: "In-game shop" } },
      { src: monolitKasyno, alt: { pl: "Kasyno", en: "Casino" } },
      { src: monolitCzat, alt: { pl: "Czat graczy", en: "Player chat" } },
    ],
    warning: {
      pl: "Backend stoi na darmowym planie, który usypia po okresie bezczynności. Pierwsze wejście może potrwać do ~50 sekund, zanim serwer się wybudzi.",
      en: "The backend runs on a free tier that sleeps after inactivity, so the first load may take up to ~50 seconds to wake the server.",
    },
    status: "shipped",
  },
  {
    slug: "skillrift",
    category: "gamedev",
    file: "skillrift.cs",
    title: "Skill Rift",
    blurb: {
      pl: "Skill Rift to gra zręcznościowa top-down, którą zrobiłem w Unity latem 2024 i wydałem na itch.io, w całości bez AI, opierając się na dokumentacji Unity.",
      en: "Skill Rift is a top-down arcade game I made in Unity over the summer of 2024 and released on itch.io, written without AI help, from the Unity docs.",
    },
    decisions: {
      pl: "Sprite'y i animacje narysowałem ręcznie w Aseprite, a tło menu to kilka grafik pixel art z moimi dodatkami: domkiem, cieniami i dymem. Do walki przygotowują dwa poziomy treningowe, gdzie przeciwnicy idą prosto na ciebie, a co trzy zabicia jest ich coraz więcej. Potem zostaje boss, który teleportuje się po arenie i korzysta z czterech umiejętności, w tym z czarnej dziury ciągnącej postać na środek mapy, a jego siłę można wybrać z gotowych poziomów trudności albo ustawić samemu.",
      en: "Sprites and animations are hand-drawn in Aseprite; the menu background combines a few pixel art pieces with my own additions, including the cabin, shadows and smoke. Two training levels warm you up, with enemies walking straight at you and every three kills bringing more of them, before the boss fight, where the boss teleports around the arena and cycles through four skills, including a black hole that pulls you toward the center of the map. You can pick a difficulty or set the boss's strength yourself.",
    },
    stack: ["Unity", "C#", "Aseprite"],
    links: { live: "https://despawner.itch.io/skillrift" },
    covers: [
      { src: riftMenu, alt: { pl: "Ekran menu 1", en: "Menu screen 1" } },
      { src: riftMenu2, alt: { pl: "Ekran menu 2", en: "Menu screen 2" } },
      { src: riftMenu3, alt: { pl: "Ekran menu 3", en: "Menu screen 3" } },
    ],
    mediaClass: "object-contain md:brightness-[0.85]",
    media: [
      { src: rift1, alt: { pl: "Rozgrywka — fragment 1", en: "Gameplay clip 1" } },
      { src: rift2, alt: { pl: "Rozgrywka — fragment 2", en: "Gameplay clip 2" } },
      { src: rift3, alt: { pl: "Rozgrywka — fragment 3", en: "Gameplay clip 3" } },
      { src: rift4, alt: { pl: "Rozgrywka — fragment 4", en: "Gameplay clip 4" } },
    ],
    status: "shipped",
  },
  {
    slug: "load-system",
    category: "electronics",
    file: "load-system.sch",
    title: "Load System",
    blurb: {
      pl: "Czterotorowy system generowania obciążenia mechanicznego, zaprojektowany w całości, ale nigdy niezbudowany.",
      en: "A four-channel system for generating controlled mechanical load, designed end to end but never built.",
    },
    decisions: {
      pl: "Każdy tor ma własny silnik krokowy, sprężynę i belkę tensometryczną: silnik nawija linkę na bęben o średnicy 2 mm i napina sprężynę pełniącą rolę bufora siły, a wzmacniacz HX711 odsyła zmierzoną wartość do mikrokontrolera Mega 2560, który koryguje pracę silnika aż do osiągnięcia zadanej siły. Sztywność sprężyny wynika z zakresu pracy, bo 10 N na 31,4 mm linki daje 0,32 N/mm, a wymiana sprężyny przesuwa cały zakres bez zmian w reszcie układu. Zaprojektowałem schemat, płytkę 120 × 60 mm, część mechaniczną, kod sterujący i pełną dokumentację razem z kosztorysem i instrukcją serwisową.",
      en: "Each channel has its own stepper motor, spring and strain gauge: the motor winds a cable onto a 2 mm drum and tensions the spring, which works as a force buffer, while an HX711 amplifier feeds the measured force back to a Mega 2560 that corrects the motor until it reaches the value you set. Spring stiffness follows from the working range, since 10 N across 31.4 mm of cable comes out at 0.32 N/mm, and swapping the spring shifts the whole range without changing anything else. I designed the schematic, the 120 × 60 mm PCB, the mechanical parts, the control code and the full documentation, including the bill of materials and a service manual.",
    },
    stack: ["Eagle", "Inventor", "Arduino"],
    links: { pdf: loadDoc },
    covers: [
      { src: loadTor1, alt: { pl: "Tor pomiarowy — widok 1", en: "Load channel — view 1" } },
      { src: loadTor2, alt: { pl: "Tor pomiarowy — widok 2", en: "Load channel — view 2" } },
      { src: loadTor3, alt: { pl: "Tor pomiarowy — widok 3", en: "Load channel — view 3" } },
    ],
    media: [
      { src: load1, alt: { pl: "Dokumentacja projektu — 1", en: "Design documentation — 1" } },
      { src: load2, alt: { pl: "Dokumentacja projektu — 2", en: "Design documentation — 2" } },
      { src: load3, alt: { pl: "Dokumentacja projektu — 3", en: "Design documentation — 3" } },
    ],
    mediaClass: "object-contain md:brightness-[0.85]",
    coversClass: "object-contain md:brightness-[0.85]",
    syncMs: 5000,
    status: "concept",
  },
  {
    slug: "led-chaser",
    category: "electronics",
    file: "led-chaser.sch",
    title: "LED Chaser",
    blurb: {
      pl: "Efekt świetlny na dziesięciu diodach, zbudowany na podstawie gotowego schematu z sieci i doprowadzony od symulacji do działającej płytki.",
      en: "A 10-LED chaser built from a published circuit design, taken from simulation all the way to a working board.",
    },
    decisions: {
      pl: "Odrysowałem schemat w LTSpice, żeby sprawdzić pracę dwóch generatorów relaksacyjnych odpowiadających za prędkość przełączania i jasność diod, zaprojektowałem jednostronną płytkę w Eagle, a potem wytrawiłem ją, wywierciłem i polutowałem samodzielnie. Gotowy układ zgadzał się z symulacją: zakres taktowania od 3,57 Hz do 10 Hz i prąd wyjściowy 19,34 mA wobec zakładanych 20 mA.",
      en: "I redrew the schematic in LTSpice to check the two relaxation oscillators that set the stepping speed and the LED brightness, laid out the single-sided PCB in Eagle, then etched, drilled and soldered it myself. The finished board matched the simulation: a clock range of 3.57 Hz to 10 Hz, and 19.34 mA of output current against the 20 mA I expected.",
    },
    stack: ["LTspice", "Eagle"],
    links: { pdf: ledDoc },
    covers: [
      { src: led1, alt: { pl: "Schemat i symulacja — 1", en: "Schematic and simulation — 1" } },
      { src: led2, alt: { pl: "Schemat i symulacja — 2", en: "Schematic and simulation — 2" } },
      { src: led3, alt: { pl: "Schemat i symulacja — 3", en: "Schematic and simulation — 3" } },
    ],
    media: [
      { src: ledBoard1, alt: { pl: "Gotowa płytka — widok 1", en: "Finished board — view 1" } },
      { src: ledBoard2, alt: { pl: "Gotowa płytka — widok 2", en: "Finished board — view 2" } },
      { src: ledBoard3, alt: { pl: "Gotowa płytka — widok 3", en: "Finished board — view 3" } },
    ],
    mediaClass: "object-contain md:brightness-[0.85]",
    coversClass: "object-contain md:brightness-[0.90]",
    syncMs: 5000,
    status: "shipped",
  },
];

const MIN_PER_CATEGORY = 1;
export const MISC = "misc";

export type Group = { category: string; items: Project[] };

export function groupProjects(projects: Project[]): Group[] {
  const by = new Map<string, Project[]>();
  for (const p of projects) by.set(p.category, [...(by.get(p.category) ?? []), p]);

  const groups: Group[] = [];
  const misc: Project[] = [];
  for (const [category, items] of by) {
    if (items.length >= MIN_PER_CATEGORY) groups.push({ category, items });
    else misc.push(...items);
  }
  if (misc.length) groups.push({ category: MISC, items: misc });
  return groups;
}

if (import.meta.env.DEV) {
  const p = (slug: string, category: string): Project => ({ ...PROJECTS[0], slug, category });
  const g = groupProjects([p("a", "x"), p("b", "x"), p("c", "y")]);
  console.assert(g.length === 2, "groupProjects: 2 kategorie (x + misc)");
  console.assert(g.find((x) => x.category === "x")?.items.length === 2, "groupProjects: x ma 2 wpisy");
  console.assert(g.find((x) => x.category === MISC)?.items[0].slug === "c", "groupProjects: samotne y ląduje w misc");

  console.assert(new Set(PROJECTS.map((x) => x.slug)).size === PROJECTS.length, "PROJECTS: slugi muszą być unikalne (klucz URL)");
  for (const x of PROJECTS) console.assert(x.stack.length >= 2 && x.stack.length <= 10, `PROJECTS: ${x.slug} — chipów stacku ma być 2–10`);
  for (const x of PROJECTS) console.assert(!(x.video || x.covers?.length) || x.media.length > 0, `PROJECTS: ${x.slug} — bento wymaga min. 1 zrzutu do rotacji`);
  for (const x of PROJECTS) console.assert(!(x.video && x.covers?.length), `PROJECTS: ${x.slug} — lewy kafel to albo film, albo grafiki`);
}
