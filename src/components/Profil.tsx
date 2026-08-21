import { useEffect, useState } from "react";
import profilImg from "../../img/Profil.jpg";
import type { Lang } from "./TopNav";

// Tekst bio przełączany językiem. Kod i terminal ZOSTAJĄ po angielsku niezależnie od języka.
const BIO: Record<Lang, { hi: string; role: string }> = {
  pl: { hi: "Cześć, nazywam się Rafał", role: "Full-stack developer & inżynier elektroniki" },
  en: { hi: "Hi, I'm Rafał", role: "Full-stack developer & electronics engineer" },
};

// Kolory składni w stylu VS Code Dark+. Kod/terminal to stałe assety "wrażeniowe",
// więc tokeny koloruję ręcznie — bez ciągnięcia highlightera dla dwóch snippetów.
// Token = [tekst, klucz-koloru]; brak klucza = plain.
const SYNTAX: Record<string, string> = {
  kw: "#569cd6", // słowa kluczowe: const, export, default
  var: "#9cdcfe", // nazwy zmiennych / właściwości
  str: "#ce9178", // stringi / template literale
  fn: "#dcdcaa", // wywołania metod
  p: "#d4d4d4", // interpunkcja / plain
  prompt: "#27c93f", // znak zachęty $ w terminalu
  cmd: "#e8e8ec", // wpisana komenda
  out: "#b8b8bf", // wynik działania (stdout)
};

type Tok = [text: string, key?: keyof typeof SYNTAX];

const CODE: Tok[][] = [
  [
    ["const ", "kw"],
    ["rafal", "var"],
    [" = {", "p"],
  ],
  [
    ["  role", "var"],
    [": ", "p"],
    ["'Full-stack developer'", "str"],
    [",", "p"],
  ],
  [
    ["  also", "var"],
    [": ", "p"],
    ["'Electronics engineer'", "str"],
    [",", "p"],
  ],
  [
    ["  stack", "var"],
    [": [", "p"],
    ["'React'", "str"],
    [", ", "p"],
    ["'Three.js'", "str"],
    [", ", "p"],
    ["'Node'", "str"],
    [", ", "p"],
    ["'TypeScript'", "str"],
    ["],", "p"],
  ],
  [
    ["  shipped", "var"],
    [": ", "p"],
    ["'Monolit'", "str"],
    [",", "p"],
  ],
  [
    ["  building", "var"],
    [": ", "p"],
    ["'Spring boot project'", "str"],
    [",", "p"],
  ],
  [
    ["  status", "var"],
    [": ", "p"],
    ["'open to work'", "str"],
    [",", "p"],
  ],
  [["}", "p"]],
  [],
  [
    ["console", "var"],
    [".", "p"],
    ["log", "fn"],
    ["(", "p"],
    ["`Shipped: ", "str"],
    ["${", "p"],
    ["rafal.shipped", "var"],
    ["}", "p"],
    ["`", "str"],
    [")", "p"],
  ],
  [
    ["console", "var"],
    [".", "p"],
    ["log", "fn"],
    ["(", "p"],
    ["`Now: ", "str"],
    ["${", "p"],
    ["rafal.building", "var"],
    ["}", "p"],
    ["`", "str"],
    [")", "p"],
  ],
  [
    ["console", "var"],
    [".", "p"],
    ["log", "fn"],
    ["(", "p"],
    ["`Stack: ", "str"],
    ["${", "p"],
    ["rafal.stack.", "var"],
    ["join", "fn"],
    ["(", "p"],
    ["' · '", "str"],
    [")", "p"],
    ["}", "p"],
    ["`", "str"],
    [")", "p"],
  ],
  [
    ["console", "var"],
    [".", "p"],
    ["log", "fn"],
    ["(", "p"],
    ["`Status: ", "str"],
    ["${", "p"],
    ["rafal.status", "var"],
    ["}", "p"],
    ["`", "str"],
    [")", "p"],
  ],
  [],
  [
    ["export default ", "kw"],
    ["rafal", "var"],
  ],
];

// Terminal: komenda WPISUJE się znak po znaku...
const TERM_CMD: Tok[][] = [
  [
    ["$ ", "prompt"],
    ["npx tsx profile.ts", "cmd"],
  ],
];

// ...a wynik POJAWIA się od razu (bez literowania), zakończony promptem z blokiem.
const TERM_OUT: Tok[][] = [[], [["  Shipped: Monolit ", "out"]], [["  Now: Spring boot project", "out"]], [["  Stack: React · Three.js · Node · TypeScript", "out"]], [["  Status: open to work", "out"]], [], [["$ ", "prompt"]]];

// Znaki = suma długości tokenów + po jednym na łamanie linii.
const total = (lines: Tok[][]) => lines.reduce((s, l) => s + l.reduce((a, t) => a + t[0].length, 0), 0) + (lines.length - 1);
const CODE_TOTAL = total(CODE);
const CMD_TOTAL = total(TERM_CMD);

// Czysta funkcja: zwraca linie z tokenami przyciętymi do `n` odsłoniętych znaków.
function revealLines(lines: Tok[][], n: number): { text: string; key?: keyof typeof SYNTAX }[][] {
  let left = n;
  const out: { text: string; key?: keyof typeof SYNTAX }[][] = [];
  for (let li = 0; li < lines.length; li++) {
    if (left <= 0 && li > 0) break;
    const lineOut: { text: string; key?: keyof typeof SYNTAX }[] = [];
    for (const [text, key] of lines[li]) {
      if (left <= 0) break;
      const take = Math.min(text.length, left);
      lineOut.push({ text: text.slice(0, take), key });
      left -= take;
    }
    out.push(lineOut);
    if (li < lines.length - 1) left -= 1; // koszt łamania linii
  }
  return out;
}

if (import.meta.env.DEV) {
  for (const lines of [CODE, TERM_CMD, TERM_OUT]) {
    const full = lines.map((l) => l.map((t) => t[0]).join("")).join("\n");
    const shown = revealLines(lines, total(lines))
      .map((l) => l.map((t) => t.text).join(""))
      .join("\n");
    console.assert(shown === full, "Profil typewriter: pełne odsłonięcie != pełny tekst");
  }
}

// Wpisywanie znak po znaku. `start=false` trzyma na 0 (bramka sekwencji), a
// `startDelayMs` daje pauzę zanim ruszy — stąd komenda startuje "po chwili" od kodu.
function useTypewriter(totalChars: number, charsPerSecond: number, start: boolean, startDelayMs: number): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(totalChars);
      return;
    }
    let cur = 0;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        cur += 1;
        setN(cur);
        if (cur >= totalChars) clearInterval(interval);
      }, 1000 / charsPerSecond);
    }, startDelayMs);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [totalChars, charsPerSecond, start, startDelayMs]);
  return n;
}

// Kursor: blok ▊ (terminal — "żyje", miga też po skończeniu) lub kreska ▋ (edytor).
function CodeLines({ lines, caret, caretChar = "▋" }: { lines: { text: string; key?: keyof typeof SYNTAX }[][]; caret: boolean; caretChar?: string }) {
  return (
    <>
      {lines.map((line, li) => (
        <div key={li}>
          {line.map((tok, ti) => (
            <span key={ti} style={{ color: SYNTAX[tok.key ?? "p"] }}>
              {tok.text}
            </span>
          ))}
          {caret && li === lines.length - 1 && <span className="animate-[blink_1s_step-end_infinite] text-[#d4d4d4]">{caretChar}</span>}
          {line.length === 0 && "​"}
        </div>
      ))}
    </>
  );
}

export function Profil({ className = "", lang }: { className?: string; lang: Lang }) {
  const codeN = useTypewriter(CODE_TOTAL, 100, true, 0);
  const codeDone = codeN >= CODE_TOTAL;
  const cmdN = useTypewriter(CMD_TOTAL, 45, codeDone, 450);
  const cmdDone = cmdN >= CMD_TOTAL;

  const codeLines = revealLines(CODE, codeN);
  const cmdLines = revealLines(TERM_CMD, cmdN);

  return (
    <section className={`border-line bg-surface flex min-h-40 flex-col overflow-hidden rounded-2xl border md:min-h-0 ${className}`}>
      <div className="flex items-center gap-3 p-4">
        <img src={profilImg} alt="Rafał" className="h-16 w-16 shrink-0 rounded-xl object-cover md:h-40 md:w-40" />
        <div className="min-w-0">
          <p className="text-fg text-md font-medium">{BIO[lang].hi}</p>
          <p className="text-muted text-xs">{BIO[lang].role}</p>
        </div>
      </div>

      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col gap-3">
        <div className="border-line flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-[#1e1e1e]">
          <div className="flex items-center gap-1.5 border-b border-[#333] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="text-muted ml-2 text-[11px]">profile.ts</span>
          </div>
          <div className="flex min-h-0 flex-1 overflow-auto font-mono text-[11px] leading-relaxed md:text-xs">
            <div className="px-2 py-3 text-right text-[#5a5a5a] select-none">
              {CODE.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="flex-1 py-3 pr-3 whitespace-pre">
              <CodeLines lines={codeLines} caret={!codeDone} />
            </pre>
          </div>
        </div>

        <div className="border-line flex h-48 flex-none overflow-auto rounded-xl border bg-[#141414]">
          <pre className="flex-1 px-3 py-3 font-mono text-[11px] leading-relaxed whitespace-pre md:text-xs">
            <CodeLines lines={cmdLines} caret={codeDone && !cmdDone} caretChar="▊" />
            {cmdDone && <CodeLines lines={revealLines(TERM_OUT, total(TERM_OUT))} caret caretChar="▊" />}
          </pre>
        </div>
      </div>
    </section>
  );
}
