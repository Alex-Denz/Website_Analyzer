import type {
  AnalysisResult,
  HeaderAnalysis,
  KeywordFrequency,
  NicheAnalysis,
  NicheResults,
  Recommendations,
  Similarities,
  WebsiteStructure,
  StructureRecommendation,
} from '../types';

export const analyzeHeaderPatterns = (websites: AnalysisResult[]): HeaderAnalysis => {
  const headerCounts: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] };
  const commonKeywords: Record<string, number> = {};

  websites.forEach((site) => {
    [1, 2, 3, 4].forEach((level) => {
      const count = site.headers.filter((h) => h.level === level).length;
      headerCounts[level].push(count);
    });

    site.headers.forEach((header) => {
      const words = header.text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 3);

      words.forEach((word) => {
        commonKeywords[word] = (commonKeywords[word] || 0) + 1;
      });
    });
  });

  const avgHeaderCounts: Record<number, number> = {};
  [1, 2, 3, 4].forEach((level) => {
    const counts = headerCounts[level];
    avgHeaderCounts[level] = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
  });

  const threshold = Math.ceil(websites.length * 0.3);
  const frequentKeywords: KeywordFrequency[] = Object.entries(commonKeywords)
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      frequency: count,
      percentage: Math.round((count / websites.length) * 100),
    }));

  return {
    averageHeaderCounts: avgHeaderCounts,
    commonKeywords: frequentKeywords,
    totalUniqueHeaders: websites.reduce((sum, site) => sum + site.headers.length, 0),
  };
};

const compareHeaderStructures = (headers1: AnalysisResult['headers'], headers2: AnalysisResult['headers']): number => {
  const levels1 = headers1.map((h) => h.level);
  const levels2 = headers2.map((h) => h.level);
  const maxLength = Math.max(levels1.length, levels2.length);
  if (maxLength === 0) return 0;

  let matches = 0;
  const minLength = Math.min(levels1.length, levels2.length);
  for (let i = 0; i < minLength; i++) {
    if (levels1[i] === levels2[i]) matches++;
  }
  return matches / maxLength;
};

export const calculateSimilarities = (websites: AnalysisResult[]): Similarities => {
  let totalSimilarity = 0;
  let comparisons = 0;

  for (let i = 0; i < websites.length; i++) {
    for (let j = i + 1; j < websites.length; j++) {
      totalSimilarity += compareHeaderStructures(websites[i].headers, websites[j].headers);
      comparisons++;
    }
  }

  const avg = totalSimilarity / comparisons;
  return {
    averageSimilarity: Math.round(avg * 100),
    structuralConsistency: avg > 0.6 ? 'high' : avg > 0.3 ? 'medium' : 'low',
  };
};

export const generateRecommendations = (
  headerAnalysis: HeaderAnalysis,
  avgTitleLength: number,
  avgDescLength: number
): Recommendations => ({
  metaTitle: {
    recommendedLength:
      avgTitleLength >= 50 && avgTitleLength <= 60
        ? `${Math.round(avgTitleLength)} characters (current average)`
        : '50-60 characters',
    strategy: 'Include primary keyword and brand name',
  },
  metaDescription: {
    recommendedLength:
      avgDescLength >= 150 && avgDescLength <= 160
        ? `${Math.round(avgDescLength)} characters (current average)`
        : '150-160 characters',
    strategy: 'Include primary keyword, value proposition, and call-to-action',
  },
  headerStructure: {
    h1: `Use ${headerAnalysis.averageHeaderCounts[1]} H1 tag (ideally 1)`,
    h2: `Use ${headerAnalysis.averageHeaderCounts[2]} H2 tags for main sections`,
    h3: `Use ${headerAnalysis.averageHeaderCounts[3]} H3 tags for subsections`,
    h4: `Use ${headerAnalysis.averageHeaderCounts[4]} H4 tags for detailed points`,
  },
  keywordOpportunities: headerAnalysis.commonKeywords.slice(0, 5),
  optionalHeaders: [
    'Introduction', 'Overview', 'Benefits', 'Features', 'How to',
    'Best Practices', 'Tips', 'Guide', 'FAQ', 'Conclusion',
  ],
});

export const performNicheAnalysis = (websites: AnalysisResult[]): NicheAnalysis => {
  const titleLengths = websites.map((w) => w.title.length).filter((l) => l > 0);
  const avgTitleLength = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length;

  const descLengths = websites.map((w) => w.metaDescription.length).filter((l) => l > 0);
  const avgDescLength = descLengths.reduce((a, b) => a + b, 0) / descLengths.length;

  const headerAnalysis = analyzeHeaderPatterns(websites);
  const similarities = calculateSimilarities(websites);
  const recommendations = generateRecommendations(headerAnalysis, avgTitleLength, avgDescLength);

  return {
    titleAnalysis: {
      averageLength: Math.round(avgTitleLength),
      range: [Math.min(...titleLengths), Math.max(...titleLengths)],
      recommendation: avgTitleLength >= 50 && avgTitleLength <= 60 ? 'optimal' : 'needs_adjustment',
    },
    descriptionAnalysis: {
      averageLength: Math.round(avgDescLength),
      range: [Math.min(...descLengths), Math.max(...descLengths)],
      recommendation: avgDescLength >= 150 && avgDescLength <= 160 ? 'optimal' : 'needs_adjustment',
    },
    headerAnalysis,
    similarities,
    recommendations,
  };
};

export const generateWebsiteStructure = (analysisResults: NicheResults | null): WebsiteStructure | null => {
  if (!analysisResults) return null;

  const { analysis } = analysisResults;
  const topKeywords = analysis.headerAnalysis.commonKeywords.slice(0, 3);

  const h2Recommendations: StructureRecommendation[] = topKeywords.map((kw: KeywordFrequency) => ({
    suggestion: `${kw.word.charAt(0).toUpperCase() + kw.word.slice(1)} Guide`,
    frequency: `${kw.percentage}% of analyzed sites`,
    source: 'keyword_analysis',
  }));

  const standardSections: StructureRecommendation[] = [
    { suggestion: 'Introduction', frequency: 'Recommended', source: 'best_practice' },
    { suggestion: 'Features & Benefits', frequency: 'Common pattern', source: 'best_practice' },
    { suggestion: 'How It Works', frequency: 'User guidance', source: 'best_practice' },
    { suggestion: 'FAQ', frequency: 'User support', source: 'best_practice' },
  ];
  h2Recommendations.push(...standardSections);

  const h3Recommendations: StructureRecommendation[] = [
    { suggestion: 'Key Features', parent: 'Features & Benefits' },
    { suggestion: 'Pricing Options', parent: 'Features & Benefits' },
    { suggestion: 'Step-by-Step Process', parent: 'How It Works' },
    { suggestion: 'Common Questions', parent: 'FAQ' },
    { suggestion: 'Technical Support', parent: 'FAQ' },
  ];

  const h4Recommendations: StructureRecommendation[] = [
    { suggestion: 'Feature Details', parent: 'Key Features' },
    { suggestion: 'Comparison Table', parent: 'Pricing Options' },
    { suggestion: 'Screenshots/Examples', parent: 'Step-by-Step Process' },
    { suggestion: 'Contact Information', parent: 'Technical Support' },
  ];

  return {
    meta: {
      title: {
        template: '[Primary Keyword] - [Value Proposition] | [Brand]',
        example: 'Best Online Casino - Win Big Today | YourBrand',
        length: analysis.recommendations.metaTitle.recommendedLength,
      },
      description: {
        template: '[Hook] + [Primary Keyword] + [Key Benefits] + [Call to Action]',
        example: 'Discover the best online casino experience. [Primary Keyword] with top bonuses, secure gaming, and 24/7 support. Start playing today!',
        length: analysis.recommendations.metaDescription.recommendedLength,
      },
    },
    h1: {
      suggestion: 'Primary Keyword + Brand/Service Name',
      example: 'Best [Primary Keyword] in [Location/Year]',
      notes: `Based on analysis: avg ${analysis.titleAnalysis.averageLength} chars`,
      optimalLength: '50-60 characters',
    },
    h2: h2Recommendations.slice(0, analysis.headerAnalysis.averageHeaderCounts[2] || 4),
    h3: h3Recommendations.slice(0, analysis.headerAnalysis.averageHeaderCounts[3] || 6),
    h4: h4Recommendations.slice(0, analysis.headerAnalysis.averageHeaderCounts[4] || 4),
    stats: {
      basedOnSites: analysisResults.websites.length,
      averageH2Count: analysis.headerAnalysis.averageHeaderCounts[2] || 0,
      averageH3Count: analysis.headerAnalysis.averageHeaderCounts[3] || 0,
      averageH4Count: analysis.headerAnalysis.averageHeaderCounts[4] || 0,
      topKeywords: topKeywords.map((k: KeywordFrequency) => k.word),
    },
  };
};
