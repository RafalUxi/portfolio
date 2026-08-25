import { useEffect, useRef, useState } from "react";
import type { Lang } from "./TopNav";
import idle1 from "../game/assets/idle1.png";
import idle2 from "../game/assets/idle2.png";
import left1 from "../game/assets/left1.png";
import left2 from "../game/assets/left2.png";
import right1 from "../game/assets/right1.png";
import right2 from "../game/assets/right2.png";
import bg1 from "../game/assets/bg1.png";
import bg2 from "../game/assets/bg2.png";
import bg3 from "../game/assets/bg3.png";

const SIZE = 256;

type Platform = { x: number; y: number; w: number; h: number; slide?: number; win?: boolean };
const LEVELS: { bg: string; platforms: Platform[] }[] = [
  {
    bg: bg1,
    platforms: [
      { x: 0, y: 239, w: 256, h: 16 },
      { x: 173, y: 186, w: 48, h: 10 },
      { x: 182, y: 107, w: 48, h: 10 },
      { x: 58, y: 68, w: 48, h: 10 },
    ],
  },
  {
    bg: bg2,
    platforms: [
      { x: 127, y: 242, w: 129, h: 14 },
      { x: 198, y: 174, w: 13, h: 7 },
      { x: 211, y: 173, w: 5, h: 7, slide: -1 },
      { x: 216, y: 171, w: 5, h: 7, slide: -1 },
      { x: 221, y: 169, w: 5, h: 7, slide: -1 },
      { x: 226, y: 167, w: 3, h: 7, slide: -1 },
      { x: 229, y: 166, w: 4, h: 7, slide: -1 },
      { x: 233, y: 164, w: 3, h: 7, slide: -1 },
      { x: 236, y: 162, w: 2, h: 7, slide: -1 },
      { x: 238, y: 161, w: 8, h: 8, slide: 0 },
      { x: 120, y: 116, w: 48, h: 7, slide: 0 },
      { x: 0, y: 131, w: 62, h: 15, slide: 0 },
      { x: 30, y: 74, w: 5, h: 28, slide: 1 },
      { x: 34, y: 75, w: 2, h: 27, slide: 1 },
      { x: 36, y: 76, w: 1, h: 26, slide: 1 },
      { x: 37, y: 78, w: 3, h: 24, slide: 1 },
      { x: 39, y: 80, w: 3, h: 22, slide: 1 },
      { x: 42, y: 83, w: 3, h: 19, slide: 1 },
      { x: 44, y: 87, w: 6, h: 15, slide: 1 },
      { x: 49, y: 90, w: 6, h: 12, slide: 1 },
      { x: 51, y: 96, w: 4, h: 6, slide: 1 },
      { x: 55, y: 93, w: 3, h: 9, slide: 1 },
      { x: 58, y: 95, w: 3, h: 7, slide: 1 },
      { x: 120, y: 65, w: 48, h: 7, slide: 0 },
      { x: 110, y: 30, w: 48, h: 7, slide: 0 },
    ],
  },
  {
    bg: bg3,
    platforms: [
      { x: 170, y: 241, w: 86, h: 14, slide: 0 },
      { x: 192, y: 182, w: 10, h: 59, slide: 0 },
      { x: 171, y: 173, w: 86, h: 9, slide: 0, win: true },
      { x: 101, y: 204, w: 6, h: 21, slide: 0 },
    ],
  },
];

const WIN: Record<Lang, string> = { pl: "Wygrałeś!", en: "You won!" };
const START: Record<Lang, string> = { pl: "Kliknij, aby rozpocząć", en: "Click to start" };
const DESKTOP_ONLY: Record<Lang, string> = { pl: "Zagraj na komputerze", en: "Play on desktop" };
const DESKTOP_HINT: Record<Lang, string> = { pl: "gra wymaga klawiatury", en: "keyboard required" };
const START_HINT: Record<Lang, string> = { pl: "← → ruch · Spacja skok", en: "← → move · Space jump" };
const CTRL = {
  title: { pl: "Sterowanie", en: "Controls" } as Record<Lang, string>,
  move: { pl: "ruch w lewo / prawo", en: "move left / right" } as Record<Lang, string>,
  jump: { pl: "Spacja: przytrzymaj i puść, by skoczyć (kierunek nadaje strzałka)", en: "Space: hold and release to jump (arrows set direction)" } as Record<Lang, string>,
  about: { pl: "Gra składa się z 3 map do przejścia, w tym 2 cięższe skoki.", en: "The game has 3 maps to complete, including 2 harder jumps." } as Record<Lang, string>,
};

function loadImg(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

function rectIntersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
  return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function isInteractiveFocused() {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(el.tagName) || el.isContentEditable;
}

export function JumpKing({ className = "", lang }: { className?: string; lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [level, setLevel] = useState(1);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const [isSmall, setIsSmall] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sprites = {
      idle: [loadImg(idle1), loadImg(idle2)],
      left: [loadImg(left1), loadImg(left2)],
      right: [loadImg(right1), loadImg(right2)],
    };
    const bgs = [loadImg(LEVELS[0].bg), loadImg(LEVELS[1].bg), loadImg(LEVELS[2].bg)];

    const g = {
      playerX: 125,
      playerY: 50,
      width: 12,
      height: 17,
      velocityY: 0,
      velocityX: 0,
      isGrounded: false,
      charge: 0,
      isCharging: false,
      keys: { space: false, right: false, left: false },
      timerWalk: 0,
      timerRight: 0,
      timerLeft: 0,
    };
    let lvl = 1;
    let platforms = LEVELS[0].platforms;
    let currentImg: HTMLImageElement = sprites.idle[0];

    const loadLevel = (n: number) => {
      lvl = n;
      platforms = LEVELS[n - 1].platforms;
      setLevel(n);
    };

    // Kolizja z metą leci co klatkę — winPending pilnuje, żeby finał odpalił raz
    let winPending = false;
    let winTimer: ReturnType<typeof setTimeout>;
    let winHideTimer: ReturnType<typeof setTimeout>;
    const scheduleWin = () => {
      if (winPending) return;
      winPending = true;
      winTimer = setTimeout(() => {
        setWon(true);
        loadLevel(1);
        g.playerX = 125;
        g.playerY = 50;
        g.velocityX = 0;
        g.velocityY = 0;
        g.charge = 0;
        g.isCharging = false;
        g.isGrounded = false;
        winPending = false;
        winHideTimer = setTimeout(() => setWon(false), 2600);
      }, 5000);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!startedRef.current || isInteractiveFocused()) return;
      if (e.code === "Space") {
        e.preventDefault();
        g.keys.space = true;
        if (g.isGrounded) {
          g.isCharging = true;
          g.velocityX = 0;
        }
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        g.keys.right = true;
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        g.keys.left = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!startedRef.current) return;
      if (e.code === "Space") {
        g.keys.space = false;
        if (g.isCharging) {
          g.isCharging = false;
          g.velocityY = -g.charge * 0.7;
          let dir = 0;
          if (g.keys.right) dir = 1;
          if (g.keys.left) dir = -1;
          g.velocityX = dir * (g.charge * 0.2);
          g.charge = 0;
          g.isGrounded = false;
        }
      } else if (e.code === "ArrowRight") {
        g.keys.right = false;
      } else if (e.code === "ArrowLeft") {
        g.keys.left = false;
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    const update = () => {
      if (g.isCharging && g.isGrounded && g.charge < 9) g.charge += 0.17;

      if (g.isGrounded && !g.isCharging) {
        g.velocityX = 0;
        if (g.keys.right) g.velocityX = 0.8;
        if (g.keys.left) g.velocityX = -0.8;
      }
      g.playerX += g.velocityX;

      if (g.playerX < 0) {
        g.playerX = 0;
        g.velocityX *= -0.5;
      } else if (g.playerX + g.width > SIZE) {
        g.playerX = SIZE - g.width;
        g.velocityX = -g.velocityX * 0.5;
      }

      for (const p of platforms) {
        if (rectIntersect(g.playerX, g.playerY, g.width, g.height, p.x, p.y, p.w, p.h)) {
          if (g.velocityX > 0) {
            g.playerX = p.x - g.width;
            g.velocityX = -g.velocityX * 0.5;
          } else if (g.velocityX < 0) {
            g.playerX = p.x + p.w;
            g.velocityX = -g.velocityX * 0.5;
          }
        }
      }

      g.velocityY += 0.2;
      g.playerY += g.velocityY;
      g.isGrounded = false;
      for (const p of platforms) {
        if (rectIntersect(g.playerX, g.playerY, g.width, g.height, p.x, p.y, p.w, p.h)) {
          if (g.velocityY > 0) {
            g.playerY = p.y - g.height;
            g.velocityY = 0;
            g.isGrounded = true;
            if (p.win) scheduleWin();
            if (p.slide) {
              g.playerX += p.slide;
              g.isCharging = false;
              g.charge = 0;
            } else if (!g.keys.left && !g.keys.right) {
              g.velocityX = 0;
            }
            if (!g.keys.left && !g.keys.right) g.velocityX = 0;
          } else if (g.velocityY < 0) {
            g.playerY = p.y + p.h;
            g.velocityY = 0;
          }
        }
      }

      if (g.playerY < -g.height && lvl < 3) {
        loadLevel(lvl + 1);
        g.playerY = SIZE - g.height - 5;
      } else if (g.playerY > SIZE && lvl > 1) {
        loadLevel(lvl - 1);
        g.playerY = 0;
      }

      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, SIZE, SIZE);
      const bg = bgs[lvl - 1];
      if (bg.complete && bg.naturalWidth !== 0) ctx.drawImage(bg, 0, 0, SIZE, SIZE);

      const still = g.isGrounded && !g.isCharging;
      if (still && !g.keys.left && !g.keys.right) {
        g.timerWalk++;
        g.timerRight = 0;
        g.timerLeft = 0;
        currentImg = g.timerWalk > 60 ? sprites.idle[1] : sprites.idle[0];
        if (g.timerWalk > 120) g.timerWalk = 0;
      } else if (still && g.keys.left && !g.keys.right) {
        g.timerLeft++;
        g.timerWalk = 0;
        g.timerRight = 0;
        currentImg = g.timerLeft > 16 ? sprites.left[1] : sprites.left[0];
        if (g.timerLeft > 32) g.timerLeft = 0;
      } else if (still && g.keys.right && !g.keys.left) {
        g.timerRight++;
        g.timerWalk = 0;
        g.timerLeft = 0;
        currentImg = g.timerRight > 16 ? sprites.right[1] : sprites.right[0];
        if (g.timerRight > 32) g.timerRight = 0;
      }
      if (g.isGrounded && g.isCharging) currentImg = sprites.idle[0];
      if (!g.isGrounded) {
        if (g.velocityX > 0) currentImg = sprites.right[0];
        else if (g.velocityX < 0) currentImg = sprites.left[0];
      }

      if (currentImg.complete && currentImg.naturalWidth !== 0) {
        ctx.drawImage(currentImg, g.playerX, g.playerY, g.width, g.height);
      } else {
        ctx.fillStyle = "#ff00ff";
        ctx.fillRect(g.playerX, g.playerY, g.width, g.height);
      }
    };

    let raf = requestAnimationFrame(function tick() {
      update();
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(winTimer);
      clearTimeout(winHideTimer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <section
      onClick={() => {
        if (isSmall) return;
        startedRef.current = true;
        setStarted(true);
      }}
      className={`border-line bg-surface relative overflow-hidden rounded-2xl border ${started || isSmall ? "" : "cursor-pointer"} ${className}`}
    >
      <div className="absolute inset-0 scale-110 bg-cover bg-center blur-md brightness-[0.45]" style={{ backgroundImage: `url(${LEVELS[level - 1].bg})` }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <canvas ref={canvasRef} width={SIZE} height={SIZE} className="h-full w-full object-contain [image-rendering:pixelated]" />
      </div>

      {(!started || isSmall) && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-[2px]">
          <span className="text-lg font-extrabold tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-xl">{isSmall ? DESKTOP_ONLY[lang] : START[lang]}</span>
          <span className="text-xs font-medium text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{isSmall ? DESKTOP_HINT[lang] : START_HINT[lang]}</span>
        </div>
      )}

      {won && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
          <span className="text-2xl font-extrabold tracking-wide text-[#FFD700] drop-shadow-lg md:text-3xl">{WIN[lang]}</span>
        </div>
      )}

      <div className="group absolute right-3 bottom-3 z-20 hidden md:block">
        <button aria-label={CTRL.title[lang]} className="border-line text-fg flex h-6 w-6 items-center justify-center rounded-full border bg-black/50 text-xs backdrop-blur">
          ?
        </button>
        <div className="border-line bg-base/95 pointer-events-none absolute right-0 bottom-8 w-60 rounded-lg border p-3 text-xs opacity-0 shadow-xl backdrop-blur transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <div className="text-fg mb-1 font-semibold">{CTRL.title[lang]}</div>
          <div className="text-muted">← → {CTRL.move[lang]}</div>
          <div className="text-muted mt-1">{CTRL.jump[lang]}</div>
          <div className="border-line text-muted mt-2 border-t pt-2">{CTRL.about[lang]}</div>
        </div>
      </div>
    </section>
  );
}
