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

            {/* Stats or Quick Actions could go here */}
            <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
              <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors">
                  Export Translations
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors">
                  Import Translations
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
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
