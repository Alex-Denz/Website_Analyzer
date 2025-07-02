import React, { useState } from 'react';
import { Search, Code, Copy, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const WebsiteStructureAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Niche Analysis states
  const [nicheUrls, setNicheUrls] = useState(['']);
  const [nicheHtmlInputs, setNicheHtmlInputs] = useState(['']);
  const [nicheInputModes, setNicheInputModes] = useState(['url']); // 'url' or 'html'
  const [nicheAnalysisResults, setNicheAnalysisResults] = useState(null);
  const [nicheLoading, setNicheLoading] = useState(false);
  const [nicheError, setNicheError] = useState('');
  
  // Website Structure states
  const [showStructureSection, setShowStructureSection] = useState(false);

  // Effectiveness scoring functions
  const scoreTitleEffectiveness = (title) => {
    if (!title) return { score: 0, status: 'error', message: 'Missing title' };
    const length = title.length;
    if (length >= 50 && length <= 60) return { score: 100, status: 'excellent', message: 'Perfect length' };
    if (length >= 40 && length <= 70) return { score: 80, status: 'good', message: 'Good length' };
    if (length < 30) return { score: 40, status: 'warning', message: 'Too short' };
    if (length > 80) return { score: 30, status: 'warning', message: 'Too long' };
    return { score: 60, status: 'average', message: 'Acceptable length' };
  };

  const scoreDescriptionEffectiveness = (description) => {
    if (!description) return { score: 0, status: 'error', message: 'Missing description' };
    const length = description.length;
    if (length >= 150 && length <= 160) return { score: 100, status: 'excellent', message: 'Perfect length' };
    if (length >= 120 && length <= 180) return { score: 80, status: 'good', message: 'Good length' };
    if (length < 100) return { score: 40, status: 'warning', message: 'Too short' };
    if (length > 200) return { score: 30, status: 'warning', message: 'Too long' };
    return { score: 60, status: 'average', message: 'Acceptable length' };
  };

  const scoreHeaderEffectiveness = (text, level) => {
    if (!text) return { score: 0, status: 'error', message: 'Empty header' };
    const length = text.length;
    const idealLength = level === 1 ? 60 : level === 2 ? 50 : 40;
    
    if (length <= idealLength && length >= 10) return { score: 90, status: 'excellent', message: 'Good length' };
    if (length <= idealLength + 20 && length >= 5) return { score: 70, status: 'good', message: 'Acceptable' };
    if (length < 5) return { score: 30, status: 'warning', message: 'Too short' };
    if (length > idealLength + 40) return { score: 40, status: 'warning', message: 'Too long' };
    return { score: 60, status: 'average', message: 'Average length' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'average': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const parseHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const title = doc.querySelector('title')?.textContent || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    const headers = [];
    const allHeaders = doc.querySelectorAll('h1, h2, h3, h4');
    
    allHeaders.forEach((el, index) => {
      const text = el.textContent.trim();
      if (text) {
        headers.push({
          level: parseInt(el.tagName.substring(1)),
          text,
          tag: el.tagName,
          index: index + 1,
          order: index
        });
      }
    });

    return {
      title,
      metaDescription,
      headers
    };
  };

  const analyzeFromURL = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a URL');
      return;
    }

    let processedUrl = urlInput.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    setLoading(true);
    setError('');
    
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(processedUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(processedUrl)}`,
      `https://cors-anywhere.herokuapp.com/${processedUrl}`,
      `https://thingproxy.freeboard.io/fetch/${processedUrl}`
    ];
    
    for (let i = 0; i < proxies.length; i++) {
      try {
        const response = await fetch(proxies[i]);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let htmlContent;
        
        if (proxies[i].includes('allorigins.win')) {
          const data = await response.json();
          if (data.status && data.status.http_code !== 200) {
            throw new Error(`Website returned status ${data.status.http_code}`);
          }
          htmlContent = data.contents;
        } else if (proxies[i].includes('corsproxy.io')) {
          htmlContent = await response.text();
        } else {
          htmlContent = await response.text();
        }
        
        if (!htmlContent || htmlContent.length < 10) {
          throw new Error('No content received from website');
        }
        
        const parsed = parseHTML(htmlContent);
        
        setResults({
          ...parsed,
          url: processedUrl,
          source: 'url'
        });
        return;
        
      } catch (err) {
        console.log(`Proxy ${i + 1} failed:`, err.message);
        
        if (i === proxies.length - 1) {
          setError(`Unable to fetch website. This could be due to:
          
• CORS restrictions (the website blocks cross-origin requests)
• The website is not accessible or down
• Network connectivity issues
• The website requires authentication

Try using the HTML tab instead: Visit the website manually, right-click → "View Page Source", copy the HTML, and paste it in the HTML tab.`);
        }
      }
    }
    
    setLoading(false);
  };

  const analyzeFromHTML = () => {
    if (!htmlInput.trim()) {
      setError('Please paste HTML code');
      return;
    }

    setError('');
    try {
      const parsed = parseHTML(htmlInput);
      setResults({
        ...parsed,
        source: 'html'
      });
    } catch (err) {
      setError(`Error parsing HTML: ${err.message}`);
    }
  };

  // Niche Analysis Functions
  const addNicheUrl = () => {
    if (nicheUrls.length < 10) {
      setNicheUrls([...nicheUrls, '']);
      setNicheHtmlInputs([...nicheHtmlInputs, '']);
      setNicheInputModes([...nicheInputModes, 'url']);
    }
  };

  const removeNicheUrl = (index) => {
    if (nicheUrls.length > 1) {
      setNicheUrls(nicheUrls.filter((_, i) => i !== index));
      setNicheHtmlInputs(nicheHtmlInputs.filter((_, i) => i !== index));
      setNicheInputModes(nicheInputModes.filter((_, i) => i !== index));
    }
  };

  const updateNicheUrl = (index, value) => {
    const updated = [...nicheUrls];
    updated[index] = value;
    setNicheUrls(updated);
  };

  const updateNicheHtml = (index, value) => {
    const updated = [...nicheHtmlInputs];
    updated[index] = value;
    setNicheHtmlInputs(updated);
  };

  const toggleInputMode = (index) => {
    const updated = [...nicheInputModes];
    updated[index] = updated[index] === 'url' ? 'html' : 'url';
    setNicheInputModes(updated);
  };

  // Website Structure Functions
  const toggleStructureSection = () => {
    setShowStructureSection(!showStructureSection);
  };

  // Generate Website Structure based on niche analysis
  const generateWebsiteStructure = (analysisResults) => {
    if (!analysisResults) return null;

    const { websites, analysis } = analysisResults;
    
    // Generate H1 recommendation
    const h1Recommendation = {
      suggestion: "Primary Keyword + Brand/Service Name",
      example: "Best [Primary Keyword] in [Location/Year]",
      notes: `Based on analysis: avg ${analysis.titleAnalysis.averageLength} chars`,
      optimalLength: "50-60 characters"
    };

    // Generate H2 recommendations based on common patterns
    const h2Recommendations = [];
    
    // Add common keywords as H2 suggestions
    const topKeywords = analysis.headerAnalysis.commonKeywords.slice(0, 3);
    topKeywords.forEach(keyword => {
      h2Recommendations.push({
        suggestion: `${keyword.word.charAt(0).toUpperCase() + keyword.word.slice(1)} Guide`,
        frequency: `${keyword.percentage}% of analyzed sites`,
        source: "keyword_analysis"
      });
    });

    // Add standard content sections
    const standardSections = [
      { suggestion: "Introduction", frequency: "Recommended", source: "best_practice" },
      { suggestion: "Features & Benefits", frequency: "Common pattern", source: "best_practice" },
      { suggestion: "How It Works", frequency: "User guidance", source: "best_practice" },
      { suggestion: "FAQ", frequency: "User support", source: "best_practice" }
    ];

    h2Recommendations.push(...standardSections);

    // Generate H3 recommendations
    const h3Recommendations = [
      { suggestion: "Key Features", parent: "Features & Benefits" },
      { suggestion: "Pricing Options", parent: "Features & Benefits" },
      { suggestion: "Step-by-Step Process", parent: "How It Works" },
      { suggestion: "Common Questions", parent: "FAQ" },
      { suggestion: "Technical Support", parent: "FAQ" }
    ];

    // Generate H4 recommendations
    const h4Recommendations = [
      { suggestion: "Feature Details", parent: "Key Features" },
      { suggestion: "Comparison Table", parent: "Pricing Options" },
      { suggestion: "Screenshots/Examples", parent: "Step-by-Step Process" },
      { suggestion: "Contact Information", parent: "Technical Support" }
    ];

    // Meta recommendations
    const metaRecommendations = {
      title: {
        template: "[Primary Keyword] - [Value Proposition] | [Brand]",
        example: "Best Online Casino - Win Big Today | YourBrand",
        length: analysis.recommendations.metaTitle.recommendedLength
      },
      description: {
        template: "[Hook] + [Primary Keyword] + [Key Benefits] + [Call to Action]",
        example: "Discover the best online casino experience. [Primary Keyword] with top bonuses, secure gaming, and 24/7 support. Start playing today!",
        length: analysis.recommendations.metaDescription.recommendedLength
      }
    };

    return {
      meta: metaRecommendations,
      h1: h1Recommendation,
      h2: h2Recommendations.slice(0, analysis.headerAnalysis.averageHeaderCounts[2] || 4),
      h3: h3Recommendations.slice(0, analysis.headerAnalysis.averageHeaderCounts[3] || 6),
      h4: h4Recommendations.slice(0, analysis.headerAnalysis.averageHeaderCounts[4] || 4),
      stats: {
        basedOnSites: websites.length,
        averageH2Count: analysis.headerAnalysis.averageHeaderCounts[2] || 0,
        averageH3Count: analysis.headerAnalysis.averageHeaderCounts[3] || 0,
        averageH4Count: analysis.headerAnalysis.averageHeaderCounts[4] || 0,
        topKeywords: topKeywords.map(k => k.word)
      }
    };
  };

  // Copy structure functions
  const copyStructureToClipboard = (structure) => {
    if (!structure) return;

    let output = `RECOMMENDED WEBSITE STRUCTURE\n`;
    output += `${'='.repeat(40)}\n\n`;
    
    output += `ANALYSIS SUMMARY:\n`;
    output += `Based on ${structure.stats.basedOnSites} analyzed websites\n`;
    output += `Top keywords: ${structure.stats.topKeywords.join(', ')}\n\n`;

    output += `META TAGS:\n`;
    output += `Title: ${structure.meta.title.template}\n`;
    output += `  Example: ${structure.meta.title.example}\n`;
    output += `  Length: ${structure.meta.title.length}\n\n`;
    
    output += `Description: ${structure.meta.description.template}\n`;
    output += `  Example: ${structure.meta.description.example}\n`;
    output += `  Length: ${structure.meta.description.length}\n\n`;

    output += `HEADER STRUCTURE:\n`;
    output += `H1: ${structure.h1.suggestion}\n`;
    output += `    Example: ${structure.h1.example}\n`;
    output += `    Notes: ${structure.h1.notes}\n\n`;

    structure.h2.forEach((h2, index) => {
      output += `H2: ${h2.suggestion}\n`;
      output += `    Frequency: ${h2.frequency}\n`;
      
      // Add related H3s
      const relatedH3s = structure.h3.filter(h3 => h3.parent === h2.suggestion);
      relatedH3s.forEach(h3 => {
        output += `  H3: ${h3.suggestion}\n`;
        
        // Add related H4s
        const relatedH4s = structure.h4.filter(h4 => h4.parent === h3.suggestion);
        relatedH4s.forEach(h4 => {
          output += `    H4: ${h4.suggestion}\n`;
        });
      });
      output += `\n`;
    });

    // Add orphaned H3s and H4s
    const orphanedH3s = structure.h3.filter(h3 => !structure.h2.some(h2 => h2.suggestion === h3.parent));
    orphanedH3s.forEach(h3 => {
      output += `H3: ${h3.suggestion}\n`;
    });

    const orphanedH4s = structure.h4.filter(h4 => !structure.h3.some(h3 => h3.suggestion === h4.parent));
    orphanedH4s.forEach(h4 => {
      output += `H4: ${h4.suggestion}\n`;
    });

    copyToClipboard(output);
  };

  const copySectionToClipboard = (content) => {
    copyToClipboard(content);
  };

  const analyzeNiche = async () => {
    // Get valid inputs from both URL and HTML modes
    const validInputs = [];
    
    for (let i = 0; i < nicheInputModes.length; i++) {
      if (nicheInputModes[i] === 'url' && nicheUrls[i].trim()) {
        validInputs.push({ type: 'url', value: nicheUrls[i].trim(), index: i });
      } else if (nicheInputModes[i] === 'html' && nicheHtmlInputs[i].trim()) {
        validInputs.push({ type: 'html', value: nicheHtmlInputs[i].trim(), index: i });
      }
    }
    
    if (validInputs.length < 2) {
      setNicheError('Please enter at least 2 valid URLs or HTML inputs for niche analysis');
      return;
    }

    setNicheLoading(true);
    setNicheError('');
    
    const results = [];
    const failed = [];

    for (const input of validInputs) {
      try {
        if (input.type === 'html') {
          // Parse HTML directly
          const parsed = parseHTML(input.value);
          results.push({
            url: `HTML Input ${input.index + 1}`,
            source: 'html',
            ...parsed
          });
        } else {
          // Process URL
          let processedUrl = input.value;
          if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
          }

          const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(processedUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(processedUrl)}`,
          ];
          
          let success = false;
          for (const proxy of proxies) {
            try {
              const response = await fetch(proxy);
              if (!response.ok) continue;
              
              let htmlContent;
              if (proxy.includes('allorigins.win')) {
                const data = await response.json();
                htmlContent = data.contents;
              } else {
                htmlContent = await response.text();
              }
              
              if (htmlContent && htmlContent.length > 10) {
                const parsed = parseHTML(htmlContent);
                results.push({
                  url: processedUrl,
                  source: 'url',
                  ...parsed
                });
                success = true;
                break;
              }
            } catch (err) {
              continue;
            }
          }
          
          if (!success) {
            failed.push(processedUrl);
          }
        }
      } catch (err) {
        failed.push(input.type === 'html' ? `HTML Input ${input.index + 1}` : input.value);
      }
    }

    if (results.length < 2) {
      setNicheError(`Could not analyze enough websites. Failed: ${failed.join(', ')}. Try using HTML input for failed URLs.`);
      setNicheLoading(false);
      return;
    }

    const analysis = performNicheAnalysis(results);
    setNicheAnalysisResults({
      websites: results,
      analysis,
      failed,
      analyzedCount: results.length,
      timestamp: new Date().toISOString()
    });
    
    setNicheLoading(false);
  };

  const performNicheAnalysis = (websites) => {
    const titleLengths = websites.map(w => w.title.length).filter(l => l > 0);
    const avgTitleLength = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length;
    
    const descLengths = websites.map(w => w.metaDescription.length).filter(l => l > 0);
    const avgDescLength = descLengths.reduce((a, b) => a + b, 0) / descLengths.length;
    
    const headerAnalysis = analyzeHeaderPatterns(websites);
    const similarities = calculateSimilarities(websites);
    const recommendations = generateRecommendations(websites, headerAnalysis, avgTitleLength, avgDescLength);
    
    return {
      titleAnalysis: {
        averageLength: Math.round(avgTitleLength),
        range: [Math.min(...titleLengths), Math.max(...titleLengths)],
        recommendation: avgTitleLength >= 50 && avgTitleLength <= 60 ? 'optimal' : 'needs_adjustment'
      },
      descriptionAnalysis: {
        averageLength: Math.round(avgDescLength),
        range: [Math.min(...descLengths), Math.max(...descLengths)],
        recommendation: avgDescLength >= 150 && avgDescLength <= 160 ? 'optimal' : 'needs_adjustment'
      },
      headerAnalysis,
      similarities,
      recommendations
    };
  };

  const analyzeHeaderPatterns = (websites) => {
    const headerCounts = { 1: [], 2: [], 3: [], 4: [] };
    const commonKeywords = {};
    
    websites.forEach(site => {
      [1, 2, 3, 4].forEach(level => {
        const count = site.headers.filter(h => h.level === level).length;
        headerCounts[level].push(count);
      });
      
      site.headers.forEach(header => {
        const words = header.text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        words.forEach(word => {
          if (!commonKeywords[word]) commonKeywords[word] = 0;
          commonKeywords[word]++;
        });
      });
    });
    
    const avgHeaderCounts = {};
    [1, 2, 3, 4].forEach(level => {
      const counts = headerCounts[level];
      avgHeaderCounts[level] = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
    });
    
    const threshold = Math.ceil(websites.length * 0.3);
    const frequentKeywords = Object.entries(commonKeywords)
      .filter(([word, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, frequency: count, percentage: Math.round((count / websites.length) * 100) }));
    
    return {
      averageHeaderCounts: avgHeaderCounts,
      commonKeywords: frequentKeywords,
      totalUniqueHeaders: websites.reduce((sum, site) => sum + site.headers.length, 0)
    };
  };

  const calculateSimilarities = (websites) => {
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < websites.length; i++) {
      for (let j = i + 1; j < websites.length; j++) {
        const similarity = compareHeaderStructures(websites[i].headers, websites[j].headers);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return {
      averageSimilarity: Math.round((totalSimilarity / comparisons) * 100),
      structuralConsistency: totalSimilarity / comparisons > 0.6 ? 'high' : totalSimilarity / comparisons > 0.3 ? 'medium' : 'low'
    };
  };

  const compareHeaderStructures = (headers1, headers2) => {
    const levels1 = headers1.map(h => h.level);
    const levels2 = headers2.map(h => h.level);
    
    const maxLength = Math.max(levels1.length, levels2.length);
    if (maxLength === 0) return 0;
    
    let matches = 0;
    const minLength = Math.min(levels1.length, levels2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (levels1[i] === levels2[i]) matches++;
    }
    
    return matches / maxLength;
  };

  const generateRecommendations = (websites, headerAnalysis, avgTitleLength, avgDescLength) => {
    const optionalHeaders = [
      'Introduction', 'Overview', 'Benefits', 'Features', 'How to', 'Best Practices',
      'Tips', 'Guide', 'FAQ', 'Conclusion'
    ];
    
    return {
      metaTitle: {
        recommendedLength: avgTitleLength < 50 ? '50-60 characters' : avgTitleLength > 60 ? '50-60 characters' : `${Math.round(avgTitleLength)} characters (current average)`,
        strategy: 'Include primary keyword and brand name'
      },
      metaDescription: {
        recommendedLength: avgDescLength < 150 ? '150-160 characters' : avgDescLength > 160 ? '150-160 characters' : `${Math.round(avgDescLength)} characters (current average)`,
        strategy: 'Include primary keyword, value proposition, and call-to-action'
      },
      headerStructure: {
        h1: `Use ${headerAnalysis.averageHeaderCounts[1]} H1 tag (ideally 1)`,
        h2: `Use ${headerAnalysis.averageHeaderCounts[2]} H2 tags for main sections`,
        h3: `Use ${headerAnalysis.averageHeaderCounts[3]} H3 tags for subsections`,
        h4: `Use ${headerAnalysis.averageHeaderCounts[4]} H4 tags for detailed points`
      },
      keywordOpportunities: headerAnalysis.commonKeywords.slice(0, 5),
      optionalHeaders: optionalHeaders
    };
  };

  const downloadReport = (format) => {
    if (!nicheAnalysisResults) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `niche-analysis-${timestamp}.${format}`;
    
    if (format === 'json') {
      const jsonData = JSON.stringify(nicheAnalysisResults, null, 2);
      downloadFile(jsonData, filename, 'application/json');
    } else if (format === 'txt') {
      const txtData = generateTextReport(nicheAnalysisResults);
      downloadFile(txtData, filename, 'text/plain');
    }
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateTextReport = (data) => {
    const { websites, analysis } = data;
    
    let report = `NICHE ANALYSIS REPORT\n`;
    report += `Generated: ${new Date(data.timestamp).toLocaleDateString()}\n`;
    report += `Websites Analyzed: ${data.analyzedCount}\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `ANALYZED WEBSITES:\n`;
    websites.forEach((site, i) => {
      report += `${i + 1}. ${site.url}\n`;
      report += `   Title: ${site.title}\n`;
      report += `   Description: ${site.metaDescription.substring(0, 100)}...\n`;
      report += `   Headers: ${site.headers.length}\n\n`;
    });
    
    report += `TITLE ANALYSIS:\n`;
    report += `Average Length: ${analysis.titleAnalysis.averageLength} characters\n`;
    report += `Length Range: ${analysis.titleAnalysis.range[0]} - ${analysis.titleAnalysis.range[1]} characters\n\n`;
    
    report += `HEADER STRUCTURE ANALYSIS:\n`;
    Object.entries(analysis.headerAnalysis.averageHeaderCounts).forEach(([level, count]) => {
      report += `H${level}: ${count} average per page\n`;
    });
    
    report += `\nRECOMMENDATIONS:\n`;
    report += `Meta Title: ${analysis.recommendations.metaTitle.recommendedLength}\n`;
    report += `Meta Description: ${analysis.recommendations.metaDescription.recommendedLength}\n\n`;
    
    Object.entries(analysis.recommendations.headerStructure).forEach(([tag, rec]) => {
      report += `${tag.toUpperCase()}: ${rec}\n`;
    });
    
    return report;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exportResults = () => {
    if (!results) return;
    
    let output = `Website Structure Analysis\n`;
    output += `==========================\n\n`;
    
    if (results.source === 'url') {
      output += `URL: ${results.url}\n\n`;
    }
    
    output += `Meta Title: ${results.title}\n`;
    output += `Meta Description: ${results.metaDescription}\n\n`;
    
    output += `Headers:\n`;
    results.headers.forEach(header => {
      output += `${header.tag}: ${header.text}\n`;
    });
    
    copyToClipboard(output);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-400" />
            Website Structure Analyzer
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-600 mb-6">
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'url'
                  ? 'border-b-2 border-indigo-400 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Analyze URL
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'html'
                  ? 'border-b-2 border-indigo-400 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Analyze HTML
            </button>
            <button
              onClick={() => setActiveTab('niche')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'niche'
                  ? 'border-b-2 border-indigo-400 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Niche Analysis
            </button>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            {activeTab === 'url' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={analyzeFromURL}
                  disabled={loading}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 text-black px-6 py-2 rounded-md hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
                >
                  {loading ? 'Analyzing...' : 'Analyze Website'}
                </button>
              </div>
            ) : activeTab === 'html' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    HTML Code
                  </label>
                  <textarea
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="Paste your HTML code here..."
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <button
                  onClick={analyzeFromHTML}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 text-black px-6 py-2 rounded-md hover:from-gray-200 hover:to-gray-300 flex items-center gap-2 transition-all shadow-lg"
                >
                  Analyze HTML
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URLs or HTML for Niche Analysis (2-10 inputs)
                  </label>
                  <div className="space-y-3">
                    {nicheInputModes.map((mode, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => toggleInputMode(index)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              mode === 'url' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {mode === 'url' ? 'URL' : 'HTML'}
                          </button>
                          <span className="text-xs text-gray-400">
                            {mode === 'url' ? 'Switch to HTML if URL fails' : 'Switch back to URL'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {mode === 'url' ? (
                            <input
                              type="text"
                              value={nicheUrls[index]}
                              onChange={(e) => updateNicheUrl(index, e.target.value)}
                              placeholder={`https://competitor${index + 1}.com`}
                              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <textarea
                              value={nicheHtmlInputs[index]}
                              onChange={(e) => updateNicheHtml(index, e.target.value)}
                              placeholder={`Paste HTML code for competitor ${index + 1}...`}
                              rows={4}
                              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                          )}
                          
                          {nicheInputModes.length > 1 && (
                            <button
                              onClick={() => removeNicheUrl(index)}
                              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors self-start"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {nicheInputModes.length < 10 && (
                    <button
                      onClick={addNicheUrl}
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 mt-2"
                    >
                      + Add Input
                    </button>
                  )}
                </div>
                <button
                  onClick={analyzeNiche}
                  disabled={nicheLoading}
                  className="bg-gradient-to-r from-gray-300 to-gray-400 text-black px-6 py-2 rounded-md hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
                >
                  {nicheLoading ? 'Analyzing Niche...' : 'Analyze Niche'}
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          )}

          {/* Website Structure Section */}
          {showStructureSection && (() => {
            const structure = generateWebsiteStructure(nicheAnalysisResults);
                
            if (!structure) {
                  return (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mt-6" key="error">
                      <p className="text-red-200">No analysis data available for structure generation.</p>
                    </div>
                  );
                }

                return (
                  <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-indigo-700/50 rounded-lg p-6" key="structure">
                    {/* Structure Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-indigo-400" />
                        Recommended Website Structure
                      </h3>
                      <button
                        onClick={() => copyStructureToClipboard(structure)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy All Structure
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Stats Summary */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-indigo-300 font-medium mb-2">Analysis Summary</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Based on {structure.stats.basedOnSites} analyzed websites</p>
                          <p>Recommended structure: {structure.stats.averageH2Count} H2, {structure.stats.averageH3Count} H3, {structure.stats.averageH4Count} H4 headers</p>
                          <p>Top keywords: {structure.stats.topKeywords.join(', ')}</p>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">Recommended Meta Tags</h4>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-indigo-300 text-sm font-medium">Title Tag</h5>
                            <button
                              onClick={() => copySectionToClipboard(`Title: ${structure.meta.title.template}\nExample: ${structure.meta.title.example}\nLength: ${structure.meta.title.length}`)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{structure.meta.title.template}</p>
                          <p className="text-gray-500 text-xs">Example: {structure.meta.title.example}</p>
                          <p className="text-gray-400 text-xs mt-1">Length: {structure.meta.title.length}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-indigo-300 text-sm font-medium">Meta Description</h5>
                            <button
                              onClick={() => copySectionToClipboard(`Description: ${structure.meta.description.template}\nExample: ${structure.meta.description.example}\nLength: ${structure.meta.description.length}`)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{structure.meta.description.template}</p>
                          <p className="text-gray-500 text-xs">Example: {structure.meta.description.example}</p>
                          <p className="text-gray-400 text-xs mt-1">Length: {structure.meta.description.length}</p>
                        </div>
                      </div>

                      {/* H1 */}
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">Header Structure</h4>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-red-300 text-sm font-medium">H1 (Main Heading)</h5>
                            <button
                              onClick={() => copySectionToClipboard(`H1: ${structure.h1.suggestion}\nExample: ${structure.h1.example}\nNotes: ${structure.h1.notes}`)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{structure.h1.suggestion}</p>
                          <p className="text-gray-500 text-xs">Example: {structure.h1.example}</p>
                          <p className="text-gray-400 text-xs mt-1">{structure.h1.notes} • {structure.h1.optimalLength}</p>
                        </div>
                      </div>

                      {/* H2 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-orange-300 font-medium">H2 Headings (Main Sections)</h5>
                          <button
                            onClick={() => {
                              const h2Content = structure.h2.map(h2 => `H2: ${h2.suggestion} (${h2.frequency})`).join('\n');
                              copySectionToClipboard(h2Content);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {structure.h2.map((h2, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 ml-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm">{h2.suggestion}</p>
                                <p className="text-gray-500 text-xs mt-1">{h2.frequency}</p>
                              </div>
                              <button
                                onClick={() => copySectionToClipboard(`H2: ${h2.suggestion}`)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* H3 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-yellow-300 font-medium">H3 Headings (Subsections)</h5>
                          <button
                            onClick={() => {
                              const h3Content = structure.h3.map(h3 => `H3: ${h3.suggestion} (Under: ${h3.parent})`).join('\n');
                              copySectionToClipboard(h3Content);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {structure.h3.map((h3, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 ml-8">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm">{h3.suggestion}</p>
                                <p className="text-gray-500 text-xs mt-1">Under: {h3.parent}</p>
                              </div>
                              <button
                                onClick={() => copySectionToClipboard(`H3: ${h3.suggestion}`)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* H4 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-green-300 font-medium">H4 Headings (Detail Points)</h5>
                          <button
                            onClick={() => {
                              const h4Content = structure.h4.map(h4 => `H4: ${h4.suggestion} (Under: ${h4.parent})`).join('\n');
                              copySectionToClipboard(h4Content);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {structure.h4.map((h4, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 ml-12">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm">{h4.suggestion}</p>
                                <p className="text-gray-500 text-xs mt-1">Under: {h4.parent}</p>
                              </div>
                              <button
                                onClick={() => copySectionToClipboard(`H4: ${h4.suggestion}`)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Niche Error Display */}
          {nicheError && (
            <div className="bg-red-900/50 border border-red-700 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-200">{nicheError}</span>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && activeTab !== 'niche' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
                <button
                  onClick={exportResults}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
              </div>

              {/* Meta Information */}
              <div className="grid md:grid-cols-1 gap-4">
                {/* Title */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-200">Meta Title</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const effectiveness = scoreTitleEffectiveness(results.title);
                        return (
                          <>
                            {getStatusIcon(effectiveness.status)}
                            <span className="text-sm text-gray-400">
                              {effectiveness.score}% - {effectiveness.message}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-100 flex-1 mr-2">
                      {results.title || 'No title found'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(results.title)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Length: {results.title.length} characters
                  </p>
                </div>

                {/* Description */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-200">Meta Description</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const effectiveness = scoreDescriptionEffectiveness(results.metaDescription);
                        return (
                          <>
                            {getStatusIcon(effectiveness.status)}
                            <span className="text-sm text-gray-400">
                              {effectiveness.score}% - {effectiveness.message}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-100 flex-1 mr-2">
                      {results.metaDescription || 'No description found'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(results.metaDescription)}
                      className="text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Length: {results.metaDescription.length} characters
                  </p>
                </div>
              </div>

              {/* Headers */}
              <div>
                <h3 className="font-medium text-gray-200 mb-4">
                  Headers ({results.headers.length} found)
                </h3>
                <div className="space-y-3">
                  {results.headers.length > 0 ? (
                    results.headers.map((header, index) => {
                      const effectiveness = scoreHeaderEffectiveness(header.text, header.level);
                      const indentLevel = (header.level - 1) * 16;
                      
                      return (
                        <div 
                          key={index} 
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                          style={{ marginLeft: `${indentLevel}px` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                header.level === 1 ? 'bg-red-600/20 text-red-300 border border-red-600/30' :
                                header.level === 2 ? 'bg-orange-600/20 text-orange-300 border border-orange-600/30' :
                                header.level === 3 ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30' :
                                'bg-green-600/20 text-green-300 border border-green-600/30'
                              }`}>
                                {header.tag}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(effectiveness.status)}
                              <span className="text-sm text-gray-400">
                                {effectiveness.score}% - {effectiveness.message}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-100 flex-1 mr-2">
                              {header.text}
                            </p>
                            <button
                              onClick={() => copyToClipboard(header.text)}
                              className="text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Length: {header.text.length} characters
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-4">No headers found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Niche Analysis Results */}
          {nicheAnalysisResults && activeTab === 'niche' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Niche Analysis Results</h2>
                <div className="flex gap-2">
                  <button
                    onClick={toggleStructureSection}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    {showStructureSection ? 'Hide Website Structure' : 'Generate Website Structure'}
                  </button>
                  <button
                    onClick={() => downloadReport('txt')}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Download TXT
                  </button>
                  <button
                    onClick={() => downloadReport('json')}
                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Download JSON
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium text-gray-200 mb-4">Analysis Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">{nicheAnalysisResults.analyzedCount}</div>
                    <div className="text-sm text-gray-400">Websites Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">{nicheAnalysisResults.analysis.similarities.averageSimilarity}%</div>
                    <div className="text-sm text-gray-400">Avg Similarity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">{nicheAnalysisResults.analysis.headerAnalysis.commonKeywords.length}</div>
                    <div className="text-sm text-gray-400">Common Keywords</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-6 border border-indigo-700">
                <h3 className="font-medium text-white mb-4 text-lg">📋 Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-300 mb-2">Meta Tags</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Title:</span> <span className="text-white">{nicheAnalysisResults.analysis.recommendations.metaTitle.recommendedLength}</span></div>
                      <div><span className="text-gray-400">Description:</span> <span className="text-white">{nicheAnalysisResults.analysis.recommendations.metaDescription.recommendedLength}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-300 mb-2">Header Structure</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(nicheAnalysisResults.analysis.recommendations.headerStructure).map(([tag, rec]) => (
                        <div key={tag}><span className="text-gray-400">{tag.toUpperCase()}:</span> <span className="text-white">{rec}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Website Structure Modal */}
        {showStructureSection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-400" />
                  Recommended Website Structure
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const structure = generateWebsiteStructure(nicheAnalysisResults);
                      copyStructureToClipboard(structure);
                    }}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy All
                  </button>
                  <button
                    onClick={toggleStructureSection}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                {(() => {
                  const structure = generateWebsiteStructure(nicheAnalysisResults);
                  
                  if (!structure) {
                    return (
                      <div className="text-center text-gray-300">
                        <p>No analysis data available for structure generation.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Stats Summary */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-indigo-300 font-medium mb-2">Analysis Summary</h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Based on {structure.stats.basedOnSites} analyzed websites</p>
                          <p>Recommended structure: {structure.stats.averageH2Count} H2, {structure.stats.averageH3Count} H3, {structure.stats.averageH4Count} H4 headers</p>
                          <p>Top keywords: {structure.stats.topKeywords.join(', ')}</p>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Recommended Meta Tags</h3>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-indigo-300 text-sm font-medium">Title Tag</h4>
                            <button
                              onClick={() => copySectionToClipboard(`Title: ${structure.meta.title.template}\nExample: ${structure.meta.title.example}\nLength: ${structure.meta.title.length}`)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{structure.meta.title.template}</p>
                          <p className="text-gray-500 text-xs">Example: {structure.meta.title.example}</p>
                          <p className="text-gray-400 text-xs mt-1">Length: {structure.meta.title.length}</p>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-indigo-300 text-sm font-medium">Meta Description</h4>
                            <button
                              onClick={() => copySectionToClipboard(`Description: ${structure.meta.description.template}\nExample: ${structure.meta.description.example}\nLength: ${structure.meta.description.length}`)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{structure.meta.description.template}</p>
                          <p className="text-gray-500 text-xs">Example: {structure.meta.description.example}</p>
                          <p className="text-gray-400 text-xs mt-1">Length: {structure.meta.description.length}</p>
                        </div>
                      </div>

                      {/* H1 */}
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Header Structure</h3>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-red-300 text-sm font-medium">H1 (Main Heading)</h4>
                            <button
                              onClick={() => copySectionToClipboard(`H1: ${structure.h1.suggestion}\nExample: ${structure.h1.example}\nNotes: ${structure.h1.notes}`)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{structure.h1.suggestion}</p>
                          <p className="text-gray-500 text-xs">Example: {structure.h1.example}</p>
                          <p className="text-gray-400 text-xs mt-1">{structure.h1.notes} • {structure.h1.optimalLength}</p>
                        </div>
                      </div>

                      {/* H2 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-orange-300 font-medium">H2 Headings (Main Sections)</h4>
                          <button
                            onClick={() => {
                              const h2Content = structure.h2.map(h2 => `H2: ${h2.suggestion} (${h2.frequency})`).join('\n');
                              copySectionToClipboard(h2Content);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {structure.h2.map((h2, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 ml-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm">{h2.suggestion}</p>
                                <p className="text-gray-500 text-xs mt-1">{h2.frequency}</p>
                              </div>
                              <button
                                onClick={() => copySectionToClipboard(`H2: ${h2.suggestion}`)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* H3 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-yellow-300 font-medium">H3 Headings (Subsections)</h4>
                          <button
                            onClick={() => {
                              const h3Content = structure.h3.map(h3 => `H3: ${h3.suggestion} (Under: ${h3.parent})`).join('\n');
                              copySectionToClipboard(h3Content);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {structure.h3.map((h3, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 ml-8">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm">{h3.suggestion}</p>
                                <p className="text-gray-500 text-xs mt-1">Under: {h3.parent}</p>
                              </div>
                              <button
                                onClick={() => copySectionToClipboard(`H3: ${h3.suggestion}`)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* H4 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-green-300 font-medium">H4 Headings (Detail Points)</h4>
                          <button
                            onClick={() => {
                              const h4Content = structure.h4.map(h4 => `H4: ${h4.suggestion} (Under: ${h4.parent})`).join('\n');
                              copySectionToClipboard(h4Content);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {structure.h4.map((h4, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 ml-12">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-gray-300 text-sm">{h4.suggestion}</p>
                                <p className="text-gray-500 text-xs mt-1">Under: {h4.parent}</p>
                              </div>
                              <button
                                onClick={() => copySectionToClipboard(`H4: ${h4.suggestion}`)}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
        
        {/* Help Section */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-indigo-300 mb-2">What to do if you get errors:</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <div>
              <strong className="text-white">Option 1: Use the HTML Tab (Recommended)</strong>
              <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                <li>Visit the website you want to analyze in your browser</li>
                <li>Right-click → "View Page Source" (or press Ctrl+U)</li>
                <li>Copy all the HTML code</li>
                <li>Switch to the "HTML" tab in the tool</li>
                <li>Paste the code and click "Analyze HTML"</li>
              </ol>
            </div>
            <div>
              <strong className="text-white">Option 2: Try Different URLs</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Some websites are more restrictive than others</li>
                <li>Try testing with different sites to see which ones work</li>
              </ul>
            </div>
            <p className="text-indigo-200 font-medium">
              The HTML tab method is actually more reliable and gives you the exact same results since you're getting the source directly from the website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteStructureAnalyzer;