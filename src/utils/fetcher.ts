const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

export const fetchWithProxy = async (url: string): Promise<string> => {
  let processedUrl = url.trim();
  if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
    processedUrl = 'https://' + processedUrl;
  }

  for (const makeProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxyUrl(processedUrl);
      const response = await fetch(proxyUrl);

      if (!response.ok) continue;

      let htmlContent: string;

      if (proxyUrl.includes('allorigins.win')) {
        const data = await response.json();
        if (data.status && data.status.http_code !== 200) continue;
        htmlContent = data.contents;
      } else {
        htmlContent = await response.text();
      }

      if (htmlContent && htmlContent.length > 10) {
        return htmlContent;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    'Unable to fetch website. This could be due to CORS restrictions, the site being down, or network issues. Try using the HTML tab instead.'
  );
};

export const normalizeUrl = (url: string): string => {
  let processed = url.trim();
  if (!processed.startsWith('http://') && !processed.startsWith('https://')) {
    processed = 'https://' + processed;
  }
  return processed;
};
