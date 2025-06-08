'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TranslationKeyManager from '@/components/TranslationKeyManager';
import ProjectSelector from '@/components/ProjectSelector';
import LanguageSelector from '@/components/LanguageSelector';
import AuthHeader from '@/components/AuthHeader';
import { useAuth } from '@/store/useAuthStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    // Only redirect if store is initialized and user is not authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Show loading while store is initializing or checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="h-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If initialized but not authenticated, show loading until redirect happens
  if (!isAuthenticated) {
    return (
      <div className="h-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-stone-50 dark:bg-stone-900 flex flex-col">
      {/* Authentication Header */}
      <AuthHeader />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Localization Manager
                </h1>
                <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
                  Manage your translation keys and content
                </p>
              </div>

              {/* Project Selection */}
              <ProjectSelector />

              {/* Language Selection */}
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            <TranslationKeyManager />
          </main>
        </div>
      </div>
    </div>
  );
}
