import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { BackButton } from '@/components/common/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { FileManager } from '../components/common/FileManager';

export const FileManagerPage: React.FC = () => {
  const { user } = useAuth();
  const showBackButton = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />
      {showBackButton && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <BackButton label="Back to Dashboard" />
        </div>
      )}
      <FileManager />
    </div>
  );
};
