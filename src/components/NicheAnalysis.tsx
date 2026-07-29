import { useState } from 'react';
import { Search, Copy, XCircle } from 'lucide-react';
import type { AnalysisResult, NicheResults } from '../types';
import { parseHTML } from '../utils/parser';
import { fetchWithProxy, normalizeUrl } from '../utils/fetcher';
import { performNicheAnalysis, generateWebsiteStructure } from '../utils/niche';
import { downloadFile, generateTextReport } from '../utils/clipboard';
import { ErrorMessage } from './ErrorMessage';
import { StructureModal } from './StructureModal';

type InputMode = 'url' | 'html';

interface NicheInput {
  url: string;
  html: string;
  mode: InputMode;
}

export const NicheAnalysis = () => {
  const [inputs, setInputs] = useState<NicheInput[]>([{ url: '', html: '', mode: 'url' }]);
  const [results, setResults] = useState<NicheResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStructure, setShowStructure] = useState(false);

  const addInput = () => {
    if (inputs.length < 10) {
      setInputs([...inputs, { url: '', html: '', mode: 'url' }]);
    }
  };

  const removeInput = (index: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const updateInput = (index: number, field: keyof NicheInput, value: string) => {
    const updated = [...inputs];
    updated[index] = { ...updated[index], [field]: value };
    setInputs(updated);
  };

  const toggleMode = (index: number) => {
    const updated = [...inputs];
    updated[index].mode = updated[index].mode === 'url' ? 'html' : 'url';
    setInputs(updated);
  };

  const analyze = async () => {
    const validInputs = inputs.filter(
      (inp) => (inp.mode === 'url' && inp.url.trim()) || (inp.mode === 'html' && inp.html.trim())
    );

    if (validInputs.length < 2) {
      setError('Please enter at least 2 valid URLs or HTML inputs for niche analysis');
      return;
    }

    setLoading(true);
    setError('');

    const results: AnalysisResult[] = [];
    const failed: string[] = [];

    for (const input of validInputs) {
      try {
        if (input.mode === 'html') {
          const parsed = parseHTML(input.html);
          results.push({ ...parsed, source: 'html' });
        } else {
          const url = normalizeUrl(input.url);
          const html = await fetchWithProxy(url);
          const parsed = parseHTML(html);
          results.push({ ...parsed, source: 'url', url });
        }
      } catch {
        failed.push(input.mode === 'html' ? `HTML Input` : input.url);
      }
    }

    if (results.length < 2) {
      setError(`Could not analyze enough websites. Failed: ${failed.join(', ')}. Try using HTML input for failed URLs.`);
      setLoading(false);
      return;
    }

    const analysis = performNicheAnalysis(results);
    setResults({
      websites: results,
      analysis,
      failed,
      analyzedCount: results.length,
      timestamp: new Date().toISOString(),
    });
    setLoading(false);
  };

  const downloadReport = (format: 'json' | 'txt') => {
    if (!results) return;
    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'json') {
      downloadFile(JSON.stringify(results, null, 2), `niche-analysis-${timestamp}.json`, 'application/json');
    } else {
      downloadFile(generateTextReport(results), `niche-analysis-${timestamp}.txt`, 'text/plain');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website URLs or HTML for Niche Analysis (2-10 inputs)
        </label>
        <div className="space-y-3">
          {inputs.map((input, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2 items-center">
                <button onClick={() => toggleMode(index)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    input.mode === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                  {input.mode === 'url' ? 'URL' : 'HTML'}
                </button>
                <span className="text-xs text-gray-400">
                  {input.mode === 'url' ? 'Switch to HTML if URL fails' : 'Switch back to URL'}
                </span>
              </div>
              <div className="flex gap-2">
                {input.mode === 'url' ? (
                  <input type="text" value={input.url}
                    onChange={(e) => updateInput(index, 'url', e.target.value)}
                    placeholder={`https://competitor${index + 1}.com`}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <textarea value={input.html}
                    onChange={(e) => updateInput(index, 'html', e.target.value)}
                    placeholder={`Paste HTML code for competitor ${index + 1}...`} rows={4}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono" />
                )}
                {inputs.length > 1 && (
                  <button onClick={() => removeInput(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors self-start">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {inputs.length < 10 && (
          <button onClick={addInput} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 mt-2">
            + Add Input
          </button>
        )}
      </div>

      <button onClick={analyze} disabled={loading}
        className="bg-gradient-to-r from-gray-300 to-gray-400 text-black px-6 py-2 rounded-md hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg">
        {loading ? 'Analyzing Niche...' : 'Analyze Niche'}
      </button>

      {error && <ErrorMessage message={error} />}

      {results && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-white">Niche Analysis Results</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowStructure(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm">
                <Search className="w-4 h-4" /> Generate Website Structure
              </button>
              <button onClick={() => downloadReport('txt')}
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm">
                <Copy className="w-4 h-4" /> Download TXT
              </button>
              <button onClick={() => downloadReport('json')}
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm">
                <Copy className="w-4 h-4" /> Download JSON
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="font-medium text-gray-200 mb-4">Analysis Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{results.analyzedCount}</div>
                <div className="text-sm text-gray-400">Websites Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{results.analysis.similarities.averageSimilarity}%</div>
                <div className="text-sm text-gray-400">Avg Similarity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400">{results.analysis.headerAnalysis.commonKeywords.length}</div>
                <div className="text-sm text-gray-400">Common Keywords</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-6 border border-indigo-700">
            <h3 className="font-medium text-white mb-4 text-lg">📋 Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-300 mb-2">Meta Tags</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Title:</span> <span className="text-white">{results.analysis.recommendations.metaTitle.recommendedLength}</span></div>
                  <div><span className="text-gray-400">Description:</span> <span className="text-white">{results.analysis.recommendations.metaDescription.recommendedLength}</span></div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-300 mb-2">Header Structure</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(results.analysis.recommendations.headerStructure).map(([tag, rec]) => (
                    <div key={tag}><span className="text-gray-400">{tag.toUpperCase()}:</span> <span className="text-white">{rec}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStructure && results && (
        <StructureModal
          structure={generateWebsiteStructure(results)}
          onClose={() => setShowStructure(false)}
        />
      )}
    </div>
  );
};
