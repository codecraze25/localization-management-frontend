'use client';

import { useState } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrentProject, useCurrentLanguage, useLocalizationActions } from '@/store/useLocalizationStore';
import type { Language } from '@/types';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const currentProject = useCurrentProject();
  const currentLanguage = useCurrentLanguage();
  const { setCurrentLanguage } = useLocalizationActions();

  const availableLanguages = currentProject?.languages || [];

  const handleLanguageSelect = (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);
  };

  if (!currentProject) {
    return (
      <div className="opacity-50">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          Language
        </label>
        <div className="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="text-sm">Select a project first</span>
          </div>
        </div>
      </div>
    );
  }

  if (availableLanguages.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          Language
        </label>
        <div className="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="text-sm">No languages configured</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
        Language
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-stone-400" />
          <span className="text-sm">
            {currentLanguage ? (
              <>
                {currentLanguage.flag} {currentLanguage.name}
              </>
            ) : (
              'Select a language'
            )}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {language.name}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {language.code}
                    </div>
                  </div>
                </div>
                {currentLanguage?.code === language.code && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show all available languages as chips */}
      {!isOpen && availableLanguages.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${currentLanguage?.code === language.code
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
                }`}
            >
              <span>{language.flag}</span>
              <span>{language.code}</span>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}