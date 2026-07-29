import { Copy, XCircle, Search } from 'lucide-react';
import type { WebsiteStructure, StructureRecommendation } from '../types';
import { copyToClipboard } from '../utils/clipboard';

const CopyButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="text-indigo-400 hover:text-indigo-300 transition-colors">
    <Copy className="w-3 h-3" />
  </button>
);

const StructureCard = ({
  label,
  item,
  indent = 0,
}: {
  label: string;
  item: StructureRecommendation;
  indent?: number;
}) => (
  <div className={`bg-gray-800/50 rounded-lg p-3 border border-gray-700`} style={{ marginLeft: `${indent}px` }}>
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-gray-300 text-sm">{item.suggestion}</p>
        {item.frequency && <p className="text-gray-500 text-xs mt-1">{item.frequency}</p>}
        {item.parent && <p className="text-gray-500 text-xs mt-1">Under: {item.parent}</p>}
        {item.example && <p className="text-gray-500 text-xs mt-1">Example: {item.example}</p>}
        {item.notes && <p className="text-gray-400 text-xs mt-1">{item.notes}</p>}
        {item.optimalLength && <p className="text-gray-400 text-xs mt-1">{item.optimalLength}</p>}
      </div>
      <CopyButton onClick={() => copyToClipboard(`${label}: ${item.suggestion}`)} />
    </div>
  </div>
);

export const StructureModal = ({
  structure,
  onClose,
}: {
  structure: WebsiteStructure | null;
  onClose: () => void;
}) => {
  if (!structure) return null;

  const copyAll = () => {
    let output = `RECOMMENDED WEBSITE STRUCTURE\n${'='.repeat(40)}\n\n`;
    output += `ANALYSIS SUMMARY:\nBased on ${structure.stats.basedOnSites} analyzed websites\n`;
    output += `Top keywords: ${structure.stats.topKeywords.join(', ')}\n\n`;
    output += `META TAGS:\nTitle: ${structure.meta.title.template}\n  Example: ${structure.meta.title.example}\n  Length: ${structure.meta.title.length}\n\n`;
    output += `Description: ${structure.meta.description.template}\n  Example: ${structure.meta.description.example}\n  Length: ${structure.meta.description.length}\n\n`;
    output += `HEADER STRUCTURE:\nH1: ${structure.h1.suggestion}\n    Example: ${structure.h1.example}\n    Notes: ${structure.h1.notes}\n\n`;
    structure.h2.forEach((h2) => {
      output += `H2: ${h2.suggestion}\n    Frequency: ${h2.frequency}\n`;
      structure.h3.filter((h3) => h3.parent === h2.suggestion).forEach((h3) => {
        output += `  H3: ${h3.suggestion}\n`;
        structure.h4.filter((h4) => h4.parent === h3.suggestion).forEach((h4) => {
          output += `    H4: ${h4.suggestion}\n`;
        });
      });
      output += '\n';
    });
    copyToClipboard(output);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            Recommended Website Structure
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={copyAll}
              className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm">
              <Copy className="w-4 h-4" /> Copy All
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-indigo-300 font-medium mb-2">Analysis Summary</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Based on {structure.stats.basedOnSites} analyzed websites</p>
              <p>Recommended: {structure.stats.averageH2Count} H2, {structure.stats.averageH3Count} H3, {structure.stats.averageH4Count} H4</p>
              <p>Top keywords: {structure.stats.topKeywords.join(', ')}</p>
            </div>
          </div>

          {/* Meta Tags */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Recommended Meta Tags</h3>
            <StructureCard label="Title" item={{ suggestion: structure.meta.title.template, example: structure.meta.title.example }} />
            <StructureCard label="Description" item={{ suggestion: structure.meta.description.template, example: structure.meta.description.example }} />
          </div>

          {/* H1 */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Header Structure</h3>
            <StructureCard label="H1" item={structure.h1} />
          </div>

          {/* H2 */}
          <div className="space-y-3">
            <h4 className="text-orange-300 font-medium">H2 Headings (Main Sections)</h4>
            {structure.h2.map((h2, i) => (
              <StructureCard key={i} label="H2" item={h2} indent={16} />
            ))}
          </div>

          {/* H3 */}
          <div className="space-y-3">
            <h4 className="text-yellow-300 font-medium">H3 Headings (Subsections)</h4>
            {structure.h3.map((h3, i) => (
              <StructureCard key={i} label="H3" item={h3} indent={32} />
            ))}
          </div>

          {/* H4 */}
          <div className="space-y-3">
            <h4 className="text-green-300 font-medium">H4 Headings (Detail Points)</h4>
            {structure.h4.map((h4, i) => (
              <StructureCard key={i} label="H4" item={h4} indent={48} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
