import { useState } from "react";
import { ReactLenis } from "lenis/react";
import { TopNav, type View } from "./components/TopNav";
import { RainbowCursor } from "./components/RainbowCursor";
import { Dashboard, ProjectView } from "./components/Dashboard";

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <ReactLenis root>
      <RainbowCursor />
      <TopNav view={view} onChange={setView} />
      <main className="h-max-screen w-max-full px-40 pt-8">{view === "dashboard" ? <Dashboard /> : <ProjectView />}</main>
    </ReactLenis>
  );
}
