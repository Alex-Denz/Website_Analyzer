export interface Header {
  level: number;
  text: string;
  tag: string;
  index: number;
  order: number;
}

export interface ParsedPage {
  title: string;
  metaDescription: string;
  headers: Header[];
}

export interface AnalysisResult extends ParsedPage {
  url?: string;
  source: 'url' | 'html';
}

export interface EffectivenessScore {
  score: number;
  status: 'excellent' | 'good' | 'average' | 'warning' | 'error';
  message: string;
}

export interface KeywordFrequency {
  word: string;
  frequency: number;
  percentage: number;
}

export interface HeaderAnalysis {
  averageHeaderCounts: Record<number, number>;
  commonKeywords: KeywordFrequency[];
  totalUniqueHeaders: number;
}

export interface Similarities {
  averageSimilarity: number;
  structuralConsistency: 'high' | 'medium' | 'low';
}

export interface Recommendations {
  metaTitle: { recommendedLength: string; strategy: string };
  metaDescription: { recommendedLength: string; strategy: string };
  headerStructure: Record<string, string>;
  keywordOpportunities: KeywordFrequency[];
  optionalHeaders: string[];
}

export interface NicheAnalysis {
  titleAnalysis: {
    averageLength: number;
    range: [number, number];
    recommendation: 'optimal' | 'needs_adjustment';
  };
  descriptionAnalysis: {
    averageLength: number;
    range: [number, number];
    recommendation: 'optimal' | 'needs_adjustment';
  };
  headerAnalysis: HeaderAnalysis;
  similarities: Similarities;
  recommendations: Recommendations;
}

export interface NicheResults {
  websites: AnalysisResult[];
  analysis: NicheAnalysis;
  failed: string[];
  analyzedCount: number;
  timestamp: string;
}

export interface StructureRecommendation {
  suggestion: string;
  frequency?: string;
  source?: string;
  example?: string;
  notes?: string;
  optimalLength?: string;
  parent?: string;
}

export interface WebsiteStructure {
  meta: {
    title: { template: string; example: string; length: string };
    description: { template: string; example: string; length: string };
  };
  h1: StructureRecommendation;
  h2: StructureRecommendation[];
  h3: StructureRecommendation[];
  h4: StructureRecommendation[];
  stats: {
    basedOnSites: number;
    averageH2Count: number;
    averageH3Count: number;
    averageH4Count: number;
    topKeywords: string[];
  };
}
