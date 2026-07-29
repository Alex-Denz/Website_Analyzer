import { useState } from 'react';
import { Search, Copy, Code } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { parseHTML } from '../utils/parser';
import { fetchWithProxy } from '../utils/fetcher';
import { scoreTitleEffectiveness, scoreDescriptionEffectiveness, scoreHeaderEffectiveness } from '../utils/scoring';
import { copyToClipboard } from '../utils/clipboard';
import { ScoreBadge } from './StatusIcon';
import { ErrorMessage } from './ErrorMessage';

export const SingleAnalysis = () => {
  const [activeTab, setActiveTab] = useState<'url' | 'html'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeFromURL = async () => {
    if (!urlInput.trim()) { setError('Please enter a URL'); return; }
    setLoading(true);
    setError('');
    try {
      const html = await fetchWithProxy(urlInput);
      const parsed = parseHTML(html);
      setResults({ ...parsed, source: 'url', url: urlInput.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch website');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFromHTML = () => {
    if (!htmlInput.trim()) { setError('Please paste HTML code'); return; }
    setError('');
    try {
      const parsed = parseHTML(htmlInput);
      setResults({ ...parsed, source: 'html' });
    } catch (err) {
      setError(`Error parsing HTML: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const exportResults = () => {
    if (!results) return;
    let output = `Website Structure Analysis\n==========================\n\n`;
    if (results.url) output += `URL: ${results.url}\n\n`;
    output += `Meta Title: ${results.title}\n`;
    output += `Meta Description: ${results.metaDescription}\n\n`;
    output += `Headers:\n`;
    results.headers.forEach((h) => { output += `${h.tag}: ${h.text}\n`; });
    copyToClipboard(output);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" /> URL
        </button>
        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'html' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Code className="w-4 h-4 inline mr-1" /> HTML
        </button>
      </div>

      {/* Input */}
      {activeTab === 'url' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
            <input
              type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && analyzeFromURL()}
            />
          </div>
          <button onClick={analyzeFromURL} disabled={loading}
            className="bg-gradient-to-r from-gray-300 to-gray-400 text-black px-6 py-2 rounded-md hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg">
            {loading ? 'Analyzing...' : 'Analyze Website'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">HTML Code</label>
            <textarea
              value={htmlInput} onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML code here..." rows={8}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
            />
          </div>
          <button onClick={analyzeFromHTML}
            className="bg-gradient-to-r from-gray-300 to-gray-400 text-black px-6 py-2 rounded-md hover:from-gray-200 hover:to-gray-300 flex items-center gap-2 transition-all shadow-lg">
            Analyze HTML
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
            <button onClick={exportResults}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm">
              <Copy className="w-4 h-4" /> Copy All
            </button>
          </div>

          {/* Meta Title */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-200">Meta Title</h3>
              <ScoreBadge score={scoreTitleEffectiveness(results.title)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-100 flex-1 mr-2">{results.title || 'No title found'}</p>
              <button onClick={() => copyToClipboard(results.title)} className="text-indigo-400 hover:text-indigo-300">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Length: {results.title.length} characters</p>
          </div>

          {/* Meta Description */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-200">Meta Description</h3>
              <ScoreBadge score={scoreDescriptionEffectiveness(results.metaDescription)} />
            </div>
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-100 flex-1 mr-2">{results.metaDescription || 'No description found'}</p>
              <button onClick={() => copyToClipboard(results.metaDescription)} className="text-indigo-400 hover:text-indigo-300 mt-1">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Length: {results.metaDescription.length} characters</p>
          </div>

          {/* Headers */}
          <div>
            <h3 className="font-medium text-gray-200 mb-4">Headers ({results.headers.length} found)</h3>
            <div className="space-y-3">
              {results.headers.length > 0 ? results.headers.map((header, index) => {
                const effectiveness = scoreHeaderEffectiveness(header.text, header.level);
                return (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    style={{ marginLeft: `${(header.level - 1) * 16}px` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        header.level === 1 ? 'bg-red-600/20 text-red-300 border border-red-600/30' :
                        header.level === 2 ? 'bg-orange-600/20 text-orange-300 border border-orange-600/30' :
                        header.level === 3 ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30' :
                        'bg-green-600/20 text-green-300 border border-green-600/30'
                      }`}>{header.tag}</span>
                      <ScoreBadge score={effectiveness} />
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-100 flex-1 mr-2">{header.text}</p>
                      <button onClick={() => copyToClipboard(header.text)} className="text-indigo-400 hover:text-indigo-300 mt-1">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Length: {header.text.length} characters</p>
                  </div>
                );
              }) : <p className="text-gray-400 text-center py-4">No headers found</p>}
            </div>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-indigo-300 mb-2">Getting errors?</h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong className="text-white">Use the HTML tab</strong> — visit the site, right-click → "View Page Source" (Ctrl+U), copy the HTML, and paste it here. More reliable than URL fetching.</p>
        </div>
      </div>
    </div>
  );
};
