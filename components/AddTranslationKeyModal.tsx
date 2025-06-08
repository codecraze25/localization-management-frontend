'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useCreateTranslationKey } from '@/hooks/useApi';
import { useCurrentProject } from '@/store/useLocalizationStore';
import type { CreateTranslationKeyRequest } from '@/lib/api/types';

interface AddTranslationKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTranslationKeyModal({ isOpen, onClose }: AddTranslationKeyModalProps) {
  const currentProject = useCurrentProject();
  const createMutation = useCreateTranslationKey();

  const [formData, setFormData] = useState({
    key: '',
    category: '',
    description: '',
    initialTranslations: {} as Record<string, string>
  });

  const availableLanguages = currentProject?.languages || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProject || !formData.key.trim() || !formData.category.trim()) {
      return;
    }

    try {
      const createData: CreateTranslationKeyRequest = {
        projectId: currentProject.id,
        key: formData.key.trim(),
        category: formData.category.trim(),
        description: formData.description.trim() || undefined,
        initialTranslations: formData.initialTranslations
      };

      await createMutation.mutateAsync(createData);

      // Reset form and close modal
      setFormData({
        key: '',
        category: '',
        description: '',
        initialTranslations: {}
      });
      onClose();
    } catch (error) {
      console.error('Failed to create translation key:', error);
    }
  };

  const handleTranslationChange = (languageCode: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      initialTranslations: {
        ...prev.initialTranslations,
        [languageCode]: value
      }
    }));
  };

  const handleClose = () => {
    setFormData({
      key: '',
      category: '',
      description: '',
      initialTranslations: {}
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-stone-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100">
              Add Translation Key
            </h3>
            <button
              onClick={handleClose}
              className="rounded-md p-2 text-stone-400 hover:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Translation Key *
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="e.g., button.save, modal.title"
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., buttons, modals, forms"
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for context"
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 resize-none"
              />
            </div>

            {/* Translations */}
            {availableLanguages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                  Initial Translations
                </label>
                <div className="space-y-3">
                  {availableLanguages.map((language) => (
                    <div key={language.code}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{language.flag}</span>
                        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                          {language.name}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.initialTranslations[language.code] || ''}
                        onChange={(e) => handleTranslationChange(language.code, e.target.value)}
                        placeholder={`Translation in ${language.name}`}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 dark:bg-stone-700 dark:text-stone-300 dark:border-stone-600 dark:hover:bg-stone-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !formData.key.trim() || !formData.category.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Create Key
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}