import { Search, Code } from 'lucide-react';

type Tab = 'url' | 'html' | 'niche';

const tabs: { id: Tab; label: string; icon: typeof Search }[] = [
  { id: 'url', label: 'Analyze URL', icon: Search },
  { id: 'html', label: 'Analyze HTML', icon: Code },
  { id: 'niche', label: 'Niche Analysis', icon: Search },
];

export const TabNavigation = ({ activeTab, onChange }: { activeTab: Tab; onChange: (tab: Tab) => void }) => (
  <div className="flex border-b border-gray-600 mb-6">
    {tabs.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`px-4 py-2 font-medium transition-colors ${
          activeTab === id
            ? 'border-b-2 border-indigo-400 text-indigo-300'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Icon className="w-4 h-4 inline mr-2" />
        {label}
      </button>
    ))}
  </div>
);
