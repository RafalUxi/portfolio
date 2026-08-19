export type View = 'dashboard' | 'project'

const TABS: { id: View; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'project', label: 'Project' },
]

export function TopNav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
        <div role="tablist" className="flex gap-1 rounded-full border border-line bg-surface p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              onClick={() => onChange(id)}
              className={`rounded-full px-5 py-1.5 text-sm transition-colors ${
                view === id ? 'bg-fg text-base' : 'text-muted hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
