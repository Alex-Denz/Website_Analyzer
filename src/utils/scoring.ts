import type { EffectivenessScore } from '../types';

export const scoreTitleEffectiveness = (title: string): EffectivenessScore => {
  if (!title) return { score: 0, status: 'error', message: 'Missing title' };
  const length = title.length;
  if (length >= 50 && length <= 60) return { score: 100, status: 'excellent', message: 'Perfect length' };
  if (length >= 40 && length <= 70) return { score: 80, status: 'good', message: 'Good length' };
  if (length < 30) return { score: 40, status: 'warning', message: 'Too short' };
  if (length > 80) return { score: 30, status: 'warning', message: 'Too long' };
  return { score: 60, status: 'average', message: 'Acceptable length' };
};

export const scoreDescriptionEffectiveness = (description: string): EffectivenessScore => {
  if (!description) return { score: 0, status: 'error', message: 'Missing description' };
  const length = description.length;
  if (length >= 150 && length <= 160) return { score: 100, status: 'excellent', message: 'Perfect length' };
  if (length >= 120 && length <= 180) return { score: 80, status: 'good', message: 'Good length' };
  if (length < 100) return { score: 40, status: 'warning', message: 'Too short' };
  if (length > 200) return { score: 30, status: 'warning', message: 'Too long' };
  return { score: 60, status: 'average', message: 'Acceptable length' };
};

export const scoreHeaderEffectiveness = (text: string, level: number): EffectivenessScore => {
  if (!text) return { score: 0, status: 'error', message: 'Empty header' };
  const length = text.length;
  const idealLength = level === 1 ? 60 : level === 2 ? 50 : 40;

  if (length <= idealLength && length >= 10) return { score: 90, status: 'excellent', message: 'Good length' };
  if (length <= idealLength + 20 && length >= 5) return { score: 70, status: 'good', message: 'Acceptable' };
  if (length < 5) return { score: 30, status: 'warning', message: 'Too short' };
  if (length > idealLength + 40) return { score: 40, status: 'warning', message: 'Too long' };
  return { score: 60, status: 'average', message: 'Average length' };
};
