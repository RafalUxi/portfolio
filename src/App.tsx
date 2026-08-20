import { useState } from "react";
import { ReactLenis } from "lenis/react";
import { TopNav, type View } from "./components/TopNav";
import { RainbowCursor } from "./components/RainbowCursor";
import { Dashboard, ProjectView } from "./components/Dashboard";

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <ReactLenis root>
      <div className="flex h-screen flex-col overflow-hidden">
        <RainbowCursor />
        <TopNav view={view} onChange={setView} />
        <main className="min-h-0 flex-1 overflow-hidden px-10 pt-10 pb-10">{view === "dashboard" ? <Dashboard /> : <ProjectView />}</main>
      </div>
    </ReactLenis>
  );
}
