import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { EffectivenessScore } from '../types';

const iconMap = {
  excellent: <CheckCircle className="w-4 h-4 text-green-500" />,
  good: <CheckCircle className="w-4 h-4 text-blue-500" />,
  average: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  warning: <AlertCircle className="w-4 h-4 text-orange-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
};

export const StatusIcon = ({ status }: { status: EffectivenessScore['status'] }) => iconMap[status] ?? null;

export const ScoreBadge = ({ score }: { score: EffectivenessScore }) => (
  <div className="flex items-center gap-2">
    <StatusIcon status={score.status} />
    <span className="text-sm text-gray-400">
      {score.score}% - {score.message}
    </span>
  </div>
);
