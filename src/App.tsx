import { useState } from "react";
import { ReactLenis } from "lenis/react";
import { TopNav, type View, type Lang } from "./components/TopNav";
import { RainbowCursor } from "./components/RainbowCursor";
import { Dashboard } from "./components/Dashboard";
import { ProjectView } from "./components/Project";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [lang, setLang] = useState<Lang>("pl");
  const toggleLang = () => setLang((l) => (l === "pl" ? "en" : "pl"));

  return (
    <ReactLenis root>
      <div className="flex min-h-screen flex-col md:h-screen md:overflow-hidden">
        <RainbowCursor />
        <TopNav view={view} onChange={setView} lang={lang} onToggleLang={toggleLang} />
        <main className="min-h-0 flex-1 px-4 py-6 md:overflow-hidden md:px-10 md:py-10">{view === "dashboard" ? <Dashboard lang={lang} /> : <ProjectView lang={lang} />}</main>
      </div>
    </ReactLenis>
  );
}
