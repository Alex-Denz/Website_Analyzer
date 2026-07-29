import { XCircle } from 'lucide-react';

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-900/50 border border-red-700 rounded-md p-4 mb-6">
    <div className="flex items-start">
      <XCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
      <span className="text-red-200 whitespace-pre-line text-sm">{message}</span>
    </div>
  </div>
);
