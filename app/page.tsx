import TranslationKeyManager from '@/components/TranslationKeyManager';
import ProjectSelector from '@/components/ProjectSelector';
import LanguageSelector from '@/components/LanguageSelector';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 p-6 overflow-y-auto">
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-8">
            <TranslationKeyManager />
          </main>
        </div>
      </div>
    </div>
  );
}
