import type { Header, ParsedPage } from '../types';

export const parseHTML = (htmlString: string): ParsedPage => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const title = doc.querySelector('title')?.textContent || '';
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  const headers: Header[] = [];
  const allHeaders = doc.querySelectorAll('h1, h2, h3, h4');

  allHeaders.forEach((el, index) => {
    const text = el.textContent?.trim() || '';
    if (text) {
      headers.push({
        level: parseInt(el.tagName.substring(1)),
        text,
        tag: el.tagName,
        index: index + 1,
        order: index,
      });
    }
  });

  return { title, metaDescription, headers };
};
