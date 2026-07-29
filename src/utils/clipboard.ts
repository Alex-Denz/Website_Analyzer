export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
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

interface TextReportData {
  websites: { url?: string; title: string; metaDescription: string; headers: { tag: string; text: string; level: number }[] }[];
  analysis: {
    titleAnalysis: { averageLength: number; range: [number, number] };
    headerAnalysis: { averageHeaderCounts: Record<number, number> };
    recommendations: { metaTitle: { recommendedLength: string }; metaDescription: { recommendedLength: string }; headerStructure: Record<string, string> };
  };
  analyzedCount: number;
  timestamp: string;
}

export const generateTextReport = (data: TextReportData): string => {
  let report = `NICHE ANALYSIS REPORT\n`;
  report += `Generated: ${new Date(data.timestamp).toLocaleDateString()}\n`;
  report += `Websites Analyzed: ${data.analyzedCount}\n`;
  report += `${'='.repeat(50)}\n\n`;

  report += `ANALYZED WEBSITES:\n`;
  data.websites.forEach((site, i) => {
    report += `${i + 1}. ${site.url || 'HTML Input'}\n`;
    report += `   Title: ${site.title}\n`;
    report += `   Description: ${site.metaDescription.substring(0, 100)}...\n`;
    report += `   Headers: ${site.headers.length}\n\n`;
  });

  report += `TITLE ANALYSIS:\n`;
  report += `Average Length: ${data.analysis.titleAnalysis.averageLength} characters\n`;
  report += `Length Range: ${data.analysis.titleAnalysis.range[0]} - ${data.analysis.titleAnalysis.range[1]} characters\n\n`;

  report += `HEADER STRUCTURE ANALYSIS:\n`;
  Object.entries(data.analysis.headerAnalysis.averageHeaderCounts).forEach(([level, count]) => {
    report += `H${level}: ${count} average per page\n`;
  });

  report += `\nRECOMMENDATIONS:\n`;
  report += `Meta Title: ${data.analysis.recommendations.metaTitle.recommendedLength}\n`;
  report += `Meta Description: ${data.analysis.recommendations.metaDescription.recommendedLength}\n\n`;

  Object.entries(data.analysis.recommendations.headerStructure).forEach(([tag, rec]) => {
    report += `${tag.toUpperCase()}: ${rec}\n`;
  });

  return report;
};
