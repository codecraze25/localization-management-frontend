'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Edit3, Save, X } from 'lucide-react';
import { useTranslationKeys, useUpdateTranslation } from '@/hooks/useApi';
import {
  useCurrentProject,
  useCurrentLanguage,
  useFilters,
  useLocalizationActions
} from '@/store/useLocalizationStore';
import type { TranslationKey, TranslationKeyFilters } from '@/types';

interface TranslationKeyManagerProps {
  projectId?: string;
  className?: string;
}

export default function TranslationKeyManager({
  projectId,
  className = ''
}: TranslationKeyManagerProps) {
  const currentProject = useCurrentProject();
  const currentLanguage = useCurrentLanguage();
  const filters = useFilters();
  const { setFilters } = useLocalizationActions();

  const activeProjectId = projectId || currentProject?.id;

  // Local state for search input
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [editingCell, setEditingCell] = useState<{
    keyId: string;
    languageCode: string;
    value: string;
  } | null>(null);

  // API hooks
  const {
    data: translationData,
    isLoading,
    error
  } = useTranslationKeys(activeProjectId || '', {
    search: filters.search,
    category: filters.category,
    languageCode: filters.languageCode,
    missingTranslations: filters.missingTranslations,
  });

  const updateTranslationMutation = useUpdateTranslation();

  // Get available languages from current project
  const availableLanguages = currentProject?.languages || [];

  // Get unique categories from translation keys
  const availableCategories = useMemo(() => {
    if (!translationData?.keys) return [];
    const categories = new Set(translationData.keys.map(key => key.category));
    return Array.from(categories).sort();
  }, [translationData]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchInput });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);

  const handleEditStart = (keyId: string, languageCode: string, currentValue: string) => {
    setEditingCell({
      keyId,
      languageCode,
      value: currentValue,
    });
  };

  const handleEditSave = async () => {
    if (!editingCell) return;

    try {
      await updateTranslationMutation.mutateAsync({
        keyId: editingCell.keyId,
        languageCode: editingCell.languageCode,
        value: editingCell.value,
      });
      setEditingCell(null);
    } catch (error) {
      console.error('Failed to update translation:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
  };

  const handleFilterChange = (filterUpdate: Partial<TranslationKeyFilters>) => {
    setFilters(filterUpdate);
  };

  if (!activeProjectId) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500 dark:text-stone-400">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
          <p>Please select a project to manage translation keys.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Error Loading Translations</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-200">
            Translation Keys
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            {translationData?.total || 0} keys found
            {currentProject && ` in ${currentProject.name}`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          Add Key
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-sm border border-stone-200 dark:border-stone-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search keys..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
            className="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
          >
            <option value="">All Categories</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={filters.languageCode || ''}
            onChange={(e) => handleFilterChange({ languageCode: e.target.value || undefined })}
            className="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
          >
            <option value="">All Languages</option>
            {availableLanguages.map(language => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>

          {/* Missing Translations Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.missingTranslations || false}
              onChange={(e) => handleFilterChange({ missingTranslations: e.target.checked })}
              className="rounded border-stone-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-stone-700 dark:text-stone-300">
              Missing only
            </span>
          </label>
        </div>
      </div>

      {/* Translation Keys Table */}
      <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                    Category
                  </th>
                  {availableLanguages.map(language => (
                    <th key={language.code} className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                      {language.flag} {language.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {translationData?.keys.map((translationKey) => (
                  <tr key={translationKey.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {translationKey.key}
                        </div>
                        {translationKey.description && (
                          <div className="text-sm text-stone-500 dark:text-stone-400">
                            {translationKey.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-600 dark:text-stone-200">
                        {translationKey.category}
                      </span>
                    </td>
                    {availableLanguages.map(language => {
                      const translation = translationKey.translations[language.code];
                      const isEditing = editingCell?.keyId === translationKey.id &&
                        editingCell?.languageCode === language.code;

                      return (
                        <td key={language.code} className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({
                                  ...editingCell,
                                  value: e.target.value
                                })}
                                className="flex-1 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave();
                                  if (e.key === 'Escape') handleEditCancel();
                                }}
                              />
                              <button
                                onClick={handleEditSave}
                                disabled={updateTranslationMutation.isPending}
                                className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="p-1 text-red-600 hover:text-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div
                              className="group flex items-center gap-2 cursor-pointer"
                              onClick={() => handleEditStart(
                                translationKey.id,
                                language.code,
                                translation?.value || ''
                              )}
                            >
                              {translation ? (
                                <span className="text-sm text-stone-900 dark:text-stone-100 flex-1">
                                  {translation.value}
                                </span>
                              ) : (
                                <span className="text-sm text-stone-400 italic flex-1">
                                  Missing translation
                                </span>
                              )}
                              <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-stone-400" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && (!translationData?.keys || translationData.keys.length === 0) && (
        <div className="text-center py-12">
          <div className="text-stone-400 dark:text-stone-500 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
            No translation keys found
          </h3>
          <p className="text-stone-600 dark:text-stone-400 mb-4">
            {filters.search || filters.category || filters.languageCode || filters.missingTranslations
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first translation key.'
            }
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            Add Translation Key
          </button>
        </div>
      )}
    </div>
  );
}