import React from 'react';
import { SiteCustomization } from '@/utils/customization';

interface AuthCardProps {
  children: React.ReactNode;
  customization?: SiteCustomization;
}

export default function AuthCard({ children, customization }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {customization?.logoUrl ? (
            <img
              src={customization.logoUrl}
              alt={customization.siteName || 'Site Logo'}
              className="mx-auto h-12 w-auto mb-4"
            />
          ) : (
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {customization?.siteName || 'ByteForge Aegis'}
            </h2>
          )}
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
