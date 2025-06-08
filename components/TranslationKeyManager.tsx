'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Edit3, Save, X, AlertCircle, Trash2 } from 'lucide-react';
import { useTranslationKeys, useUpdateTranslation } from '@/hooks/useApi';
import {
  useCurrentProject,
  useCurrentLanguage,
  useFilters,
  useError,
  useLocalizationActions
} from '@/store/useLocalizationStore';
import { formatErrorMessage } from '@/lib/utils/errorFormatter';
import type { TranslationKey, TranslationKeyFilters, Language } from '@/types';
import AddTranslationKeyModal from './AddTranslationKeyModal';
import DeleteTranslationKeyModal from './DeleteTranslationKeyModal';

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
  const globalError = useError();
  const { setFilters, setError } = useLocalizationActions();

  const activeProjectId = projectId || currentProject?.id;

  // Local state for search input and modals
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<TranslationKey | null>(null);
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
    languageCode: filters.missingTranslations
      ? (currentLanguage?.code || filters.languageCode)
      : filters.languageCode,
    missingTranslations: filters.missingTranslations,
  });

  // Separate query for getting all categories (unfiltered)
  const {
    data: allTranslationData,
  } = useTranslationKeys(activeProjectId || '', {
    // No filters to get all categories
  });

  const updateTranslationMutation = useUpdateTranslation();

  // Get available languages from current project
  const availableLanguages = currentProject?.languages || [];

  // Organize languages to prioritize the selected one
  const organizedLanguages = useMemo(() => {
    if (!currentLanguage) return availableLanguages;

    const selectedLang = availableLanguages.find(lang => lang.code === currentLanguage.code);
    const otherLangs = availableLanguages.filter(lang => lang.code !== currentLanguage.code);

    return selectedLang ? [selectedLang, ...otherLangs] : availableLanguages;
  }, [availableLanguages, currentLanguage]);

  // Get unique categories from unfiltered translation keys
  const availableCategories = useMemo(() => {
    if (!allTranslationData?.keys) return [];
    const categories = new Set(allTranslationData.keys.map(key => key.category));
    return Array.from(categories).sort();
  }, [allTranslationData]);

  // Sync language filter with sidebar selection
  useEffect(() => {
    if (currentLanguage && filters.languageCode !== currentLanguage.code) {
      // Only auto-sync if no specific language filter is set
      if (!filters.languageCode) {
        setFilters({ languageCode: currentLanguage.code });
      }
    }
  }, [currentLanguage, filters.languageCode, setFilters]);

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

  const handleDeleteClick = (translationKey: TranslationKey) => {
    setKeyToDelete(translationKey);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setKeyToDelete(null);
  };

  // Helper function to check if a translation is missing for the current language
  const isMissingCurrentLanguage = (translationKey: TranslationKey) => {
    if (!currentLanguage) return false;
    const translation = translationKey.translations[currentLanguage.code];
    return !translation || !translation.value || translation.value.trim() === '';
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
          <p>{formatErrorMessage(error.message)}</p>
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
            {currentLanguage && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                {currentLanguage.flag} {currentLanguage.name}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!currentProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Add Key
        </button>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Error
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {formatErrorMessage(globalError)}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-sm border border-stone-200 dark:border-stone-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {filters.missingTranslations && currentLanguage && (
                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                  ({currentLanguage.flag} {currentLanguage.name})
                </span>
              )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                    Actions
                  </th>
                  {organizedLanguages.map((language, index) => {
                    const isCurrentLanguage = currentLanguage?.code === language.code;
                    return (
                      <th
                        key={language.code}
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isCurrentLanguage
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-l-2 border-r-2 border-blue-400'
                          : 'text-stone-500 dark:text-stone-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {language.flag} {language.name}
                          {isCurrentLanguage && (
                            <span className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-bold">
                              CURRENT
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {translationData?.keys.map((translationKey) => {
                  const missingCurrentLang = isMissingCurrentLanguage(translationKey);

                  return (
                    <tr
                      key={translationKey.id}
                      className={`hover:bg-stone-50 dark:hover:bg-stone-700/50 ${missingCurrentLang ? 'bg-red-50 dark:bg-red-900/10' : ''
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {translationKey.key}
                            </div>
                            {translationKey.description && (
                              <div className="text-sm text-stone-500 dark:text-stone-400">
                                {translationKey.description}
                              </div>
                            )}
                          </div>
                          {missingCurrentLang && (
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-600 dark:text-stone-200">
                          {translationKey.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteClick(translationKey)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={`Delete ${translationKey.key}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                      {organizedLanguages.map((language) => {
                        const translation = translationKey.translations[language.code];
                        const isEditing = editingCell?.keyId === translationKey.id &&
                          editingCell?.languageCode === language.code;
                        const isCurrentLanguage = currentLanguage?.code === language.code;
                        const isMissing = !translation || !translation.value || translation.value.trim() === '';

                        return (
                          <td
                            key={language.code}
                            className={`px-6 py-4 ${isCurrentLanguage
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-r-2 border-blue-400'
                              : ''
                              }`}
                          >
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
                                {translation && translation.value ? (
                                  <span className="text-sm text-stone-900 dark:text-stone-100 flex-1">
                                    {translation.value}
                                  </span>
                                ) : (
                                  <span className={`text-sm italic flex-1 ${isCurrentLanguage && isMissing
                                    ? 'text-red-500 font-medium'
                                    : 'text-stone-400'
                                    }`}>
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
                  );
                })}
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
        </div>
      )}

      {/* Add Translation Key Modal */}
      <AddTranslationKeyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Delete Translation Key Modal */}
      <DeleteTranslationKeyModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        translationKey={keyToDelete}
      />
    </div>
  );
}