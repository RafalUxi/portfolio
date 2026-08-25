export const STACK_COLOR = {
  frontend: "#38BDF8",
  render3d: "#A855F7",
  backend: "#22C55E",
  data: "#6366F1",
  tooling: "#F97316",
  electronics: "#14B8A6",
  creative: "#EC4899",
} as const;

const GROUP: Record<string, keyof typeof STACK_COLOR> = {
  react: "frontend",
  typescript: "frontend",
  tailwind: "frontend",
  vite: "frontend",
  "react three fiber": "render3d",
  "three.js": "render3d",
  blender: "render3d",
  "node.js": "backend",
  "socket.io": "backend",
  "spring boot": "backend",
  java: "backend",
  postgresql: "data",
  supabase: "data",
  git: "tooling",
  ltspice: "electronics",
  inventor: "electronics",
  eagle: "electronics",
  unity: "creative",
  "c#": "creative",
  aseprite: "creative",
};

export const colorFor = (tech: string): string => STACK_COLOR[GROUP[tech.toLowerCase()] ?? "tooling"];
