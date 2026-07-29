import { useState } from 'react';
import { Search } from 'lucide-react';
import { TabNavigation } from './components/TabNavigation';
import { SingleAnalysis } from './components/SingleAnalysis';
import { NicheAnalysis } from './components/NicheAnalysis';

function App() {
  const [activeTab, setActiveTab] = useState<'url' | 'html' | 'niche'>('url');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-400" />
            Website Structure Analyzer
          </h1>

          <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'niche' ? <NicheAnalysis /> : <SingleAnalysis />}
        </div>
      </div>
    </div>
  );
}

export default App;
