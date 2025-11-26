import React from 'react';

type StatusType = 'success' | 'error' | 'loading';

interface StatusMessageProps {
  type: StatusType;
  message: string;
}

export default function StatusMessage({ type, message }: StatusMessageProps) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    loading: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const icons = {
    success: '✓',
    error: '✗',
    loading: '⟳',
  };

  return (
    <div className={`border rounded-md p-4 ${styles[type]}`}>
      <div className="flex items-center">
        <span className="text-xl mr-3">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
