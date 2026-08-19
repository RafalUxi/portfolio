# Portfolio — kontekst projektu (CLAUDE.md)

> Ten plik to pierwszy, pełny kontekst projektu. Zapisz go jako `CLAUDE.md` w rootcie repo (Claude Code czyta go automatycznie) albo wklej jako pierwszą wiadomość. Buduję to etapami — każdy etap weryfikuję i ewentualnie modyfikuję, dopiero potem idziemy dalej.

---

## 0. Cel

Buduję osobiste **portfolio** w układzie **bento grid**, minimalistyczne, domyślnie w ciemnym klimacie. To jednocześnie portfolio i projekt do nauki. Strona ma dwa widoki przełączane u góry: **Dashboard** (bento z boksami — poniżej) i **Project** (na razie pusty, rozpiszemy później).

O mnie w skrócie: Rafał, full-stack developer + inżynier elektroniki (mechatronika, PWr). Mam za sobą shippowany projekt MMO "Monolit" (React Three Fiber, Node, Socket.IO, TS, Supabase), więc znam R3F i stack z Monolitu.

---

## 1. Jak pracujemy (zasady — trzymaj się ich cały czas)

1. **Budowa etapami z bramkami weryfikacji.** Robisz JEDEN etap, zatrzymujesz się, ja weryfikuję i akceptuję/modyfikuję, dopiero wtedy przechodzimy do następnego. Nie wybiegaj do przodu poza zakres bieżącego etapu.
2. **Library-first.** Zawsze korzystaj z gotowych, sprawdzonych i utrzymywanych bibliotek zamiast pisać funkcje od zera (fizyka, animacje, ikony, mapa itd.). Upewniaj się co do aktualnego API bibliotek zanim ich użyjesz.
3. **Kod optymalny i czytelny.** TypeScript wszędzie, sensowne nazwy, komponenty małe i jednoodpowiedzialnościowe, bez magic numbers bez komentarza.
4. **Wyjaśniaj decyzje.** Przy wyborze biblioteki/architektury krótko powiedz dlaczego i jaki jest tradeoff. Przy większych rozwidleniach — zapytaj mnie, zanim zaczniesz kodzić.
5. **Szczery feedback.** Jak coś jest złym pomysłem, słabo się wyskaluje albo zabije performance na telefonie — powiedz wprost, bez owijania. Wolę prawdę niż potwierdzanie.

---

## 2. Stack technologiczny

**Baza (ustalone):** Vite + **React** + **TypeScript** + **Tailwind CSS**.

**Do konkretnych boksów (propozycje — potwierdź / zaproponuj lepsze):**

| Obszar | Propozycja | Uwaga |
|---|---|---|
| Scena 3D / gra | `@react-three/fiber` (+ `@react-three/drei`) | znam z Monolitu; gra 2D renderowana na `<canvas>` / CanvasTexture |
| Fizyka klocków (Skills) | `matter.js` | fizyka 2D: spadanie, chwytanie, rzucanie, ściany kontenera |
| Smooth scroll | `lenis` | już używane w starym kodzie |
| Ikony społecznościowe | `react-icons` lub `lucide-react` | z biblioteki, nie ręcznie |
| Mapa doświadczenia | SVG/canvas dot-matrix Europy | punkty + tooltipe (patrz boks 2) |
| Efekt pisania kodu | lekki typewriter (własny hook lub mała lib) | + subtelny dźwięk klawiatury |
| Motyw ciemny/jasny | Tailwind `dark:` + kontekst/toggle | default: ciemny |

Rzeczy oznaczone jako propozycja **flaguj do decyzji**, nie zakładaj po cichu.

**Globalne efekty (na całej stronie):**
- Kursor: **tęczowa linia** (rainbow trail).
- **Lenis** smooth scroll.
- Domyślnie **ciemny** motyw.

---

## 3. Layout — górna nawigacja + bento

**Góra strony:** panel z dwoma zakładkami — **Dashboard** i **Project** — oraz **przełącznik ciemny/jasny** (domyślnie ciemny).

**Dashboard = bento grid z boksami:**
1. Profil (zdjęcie + opis + „żywy" kod).
2. Mapa doświadczenia (interaktywna).
3. Gra (Jump King — z mojego kodu).
4. Seria małych boksów: ikony social (YouTube, Instagram, GitHub, LinkedIn, mail).
5. Stack / Skills (kontener z fizycznymi klockami).

Makieta rozmieszczenia jest w pliku `1.png`. Uwaga: część treści na makiecie to placeholdery z szablonu (obiekt „Senior product designer", chmura skilli design'owych) — do zastąpienia moją realną treścią, opis niżej.

---

## 4. Boksy — szczegóły

### Boks 1 — Profil
- Zdjęcie mnie + krótki opis (full-stack dev & inżynier elektroniki).
- W boksie widok w stylu **VS Code**: kod, który **sam zaczyna się pisać** (typewriter) przy załadowaniu strony, a w tle **subtelny dźwięk klawiatury**.
- Kod ma być zrozumiały dla każdego, ale budować profesjonalny klimat (nie musi to być realny fragment aplikacji — ma robić wrażenie i dać się przeczytać).

### Boks 2 — Mapa doświadczenia (nauka + praktyki)
- Interaktywna mapa **Europy** złożona z **kropek** (dot-matrix).
- **3 punkty** (opisy uzupełnię potem sam, zostaw miejsce w danych):
  - **Częstochowa** — praktyki przy druku 3D.
  - **Drezno** — praktyki studenckie / projekt, oficjalnie 06.10–10.10, druk 3D.
  - **Wrocław** — studia: Elektronika i Telekomunikacja (inż.) + Elektroniczne Systemy Mechatroniki (mgr); publikacja naukowa na konferencji **Eurosensors 2025** (1 artykuł jako autor + 1 jako współautor).
- Interakcja: po najechaniu na kropkę **smukłe rozwinięcie** (tooltip / panel) z miejscem, opisem co tam robiłem i datą. Dane trzymaj w osobnej, łatwej do edycji strukturze (tablica obiektów).

### Boks 3 — Gra (Jump King)
- Stary, działający kod gry jest w `app.js` (wanilia JS + Three.js). **Trzeba go przerobić** i wpiąć do boksa jako komponent React. Reużywamy logikę i grafiki, nie piszemy od zera.
- Co jest w `app.js` do reużycia:
  - **Mechanika charge-jump** (Jump King): trzymanie spacji ładuje skok (`charge` rośnie gdy `isGrounded`), puszczenie wystrzeliwuje; kierunek zależy od trzymanej strzałki w momencie puszczenia; siła pozioma proporcjonalna do naładowania. Odbicie od ścian/platform („wall bonk").
  - **Grawitacja + kolizje** (`rectIntersect`, kolizje X i Y osobno), platformy z opcjonalnym `slide`.
  - **Poziomy 1–3** (`loadLevel`) z tablicami platform i tłami `BC1/BC2/BC3`. Wyjście górą → następny poziom, dołem → poprzedni.
  - **Animacje sprite'ów**: idle (2 klatki), lewo (2), prawo (2); render na canvasie 256×256, nearest-neighbor (pixel art).
- Sterowanie desktop: **strzałki + spacja**.
- Uwaga: w `app.js` jest też oddzielna scena 3D z telewizorem (`telewizor.glb`, raycaster, zoom kamerą), na którym gra leci jako tekstura. **Decyzja do podjęcia:** czy w boksie chcemy płaską grę 2D, czy zachowujemy koncept „gra na ekranie TV". Domyślnie zakładam **płaską grę 2D w boksie**, TV opcjonalnie później. (Import-y `cursor.js`, `ui.js`, `backstar.js`, `startLoader.js`, `scroll.js` z `app.js` nie przenoszą się 1:1 — to osobne moduły.)
- Kod gry jest „działa, ale do ogarnięcia" — przy porcie od razu porządkujemy (typy, rozbicie na moduły, usunięcie zdublowanej logiki).

### Boks 4 — Ikony social (seria małych boksów)
- Małe boksy z ikonami: **YouTube, Instagram, GitHub, LinkedIn, mail**. Ikony **z biblioteki**.
- Linki: YouTube „Full Stack Logs", `instagram.com/uxi_dev`, `github.com/RafalUxi/mmo-sandbox-3d` (dokładne linki podam / potwierdzę).

### Boks 5 — Stack / Skills (fizyka)
- Kontener, w którym są **klocki** (etykiety technologii), które można **złapać i rzucić o ścianę**. Przy załadowaniu strony wszystkie **spadają od góry**, mają fizykę i są ograniczone ściankami kontenera (`matter.js`).
- Zawartość klocków = stack z Monolitu + dodatkowe programy, np.: React, React Three Fiber, Three.js, Node.js, Socket.IO, TypeScript, PostgreSQL / Supabase, Tailwind, Git, **Blender**, … (finalną listę podam).

---

## 5. Istniejące assety

- `app.js` — stara implementacja gry + scena 3D z TV (opis wyżej). Źródło logiki gry i danych poziomów.
- Grafiki pixel-art zrobione przeze mnie: sprite'y postaci (`idle/`, `lewo/`, `prawo/`), tła poziomów `BC1.png`, `BC2.png`, `BC3.png`.
- `telewizor.glb` — model TV (opcjonalny, tylko jeśli zostajemy przy koncepcie ekranu).
- `1.png` — makieta rozmieszczenia bento.

---

## 6. Roadmapa (etapy — jeden po drugim, z weryfikacją)

1. **Szkielet.** Ciemne tło, górna nawigacja (Dashboard | Project), przełączanie widoków Dashboard ↔ Project (Project pusty), pusty bento grid z placeholderami boksów. Globalnie: Lenis + tęczowy kursor.
2. **Toggle ciemny/jasny** (default ciemny).
3. **Boksy pojedynczo**, każdy osobno, weryfikacja po każdym. Sugerowana kolejność (do zmiany): Profil → Mapa → Ikony social → Skills (fizyka) → Gra. Grę na koniec, bo najbardziej złożona.
4. **Responsywność.** Na telefonie grid staje się **pionowy**, boksy o różnych wysokościach. W grze wtedy sterowanie **dotykowe**: tap w jedną stronę ekranu = kierunek + ładowanie skoku, sterowanie po prawej stronie ekranu.
5. **Sekcja Project** — rozpisanie projektów, po powyższym.

---

## 7. Otwarte decyzje (ustalmy zanim ruszą dane etapy)

- Gra w boksie: **płaska 2D** czy **na ekranie TV 3D**? (domyślnie 2D)
- Biblioteki oznaczone jako „propozycja" w sekcji 2 — akceptujesz czy zmieniamy?
- Placeholdery z makiety (kod w boksie Profil, lista skilli) — finalna treść ode mnie.
- Kolejność budowania boksów w etapie 3.

---

**Start:** zacznij od etapu 1 (szkielet). Zanim zaczniesz kodzić, wypisz krótko: jakie biblioteki zainstalujesz i jaką strukturę katalogów proponujesz — zatwierdzę, potem budujemy.
