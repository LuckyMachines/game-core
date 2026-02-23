import { useState } from 'react';
import SectionOverview from './SectionOverview';
import SectionActions from './SectionActions';
import SectionTools from './SectionTools';
import SectionHowTo from './SectionHowTo';

const TABS = [
  { key: 'overview', label: 'Mission Brief', Component: SectionOverview },
  { key: 'actions', label: 'Actions', Component: SectionActions },
  { key: 'tools', label: 'Equipment', Component: SectionTools },
  { key: 'howto', label: 'How to Play', Component: SectionHowTo },
];

export default function FieldManual() {
  const [activeTab, setActiveTab] = useState('overview');
  const Active = TABS.find((t) => t.key === activeTab)?.Component ?? SectionOverview;

  return (
    <div>
      {/* Header bar */}
      <div className="bg-vault-dark border-b border-vault-border px-5 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg tracking-[0.25em] text-tungsten uppercase">
            Field Manual
          </h2>
          <span className="font-mono text-[10px] text-vault-text-dim tracking-wider uppercase">
            Plundrix // Ops Reference
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 px-5 pt-4 pb-2">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider
                border rounded transition-all duration-200
                ${isActive
                  ? 'text-tungsten bg-tungsten/10 border-tungsten/40'
                  : 'text-vault-text-dim bg-vault-dark/40 border-vault-border hover:text-vault-text hover:border-vault-text-dim/40'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <Active />
      </div>
    </div>
  );
}
