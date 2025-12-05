import React from 'react';

type StatusType = 'success' | 'error' | 'loading';

interface StatusMessageProps {
  type: StatusType;
  message: string;
}

export default function StatusMessage({ type, message }: StatusMessageProps) {
  const styles = {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: '#22c55e',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#ef4444',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    loading: {
      bg: 'rgba(212, 116, 12, 0.1)',
      border: 'rgba(212, 116, 12, 0.3)',
      text: 'var(--ember-glow)',
      icon: (
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
    },
  };

  const style = styles[type];

  return (
    <div
      className="flex items-center gap-3 rounded-lg p-4"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
      }}
    >
      {style.icon}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
