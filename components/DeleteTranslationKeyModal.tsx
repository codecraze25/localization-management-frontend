'use client';

import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useDeleteTranslationKey } from '@/hooks/useApi';
import type { TranslationKey } from '@/types';

interface DeleteTranslationKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  translationKey: TranslationKey | null;
}

export default function DeleteTranslationKeyModal({
  isOpen,
  onClose,
  translationKey
}: DeleteTranslationKeyModalProps) {
  const deleteMutation = useDeleteTranslationKey();

  const handleDelete = async () => {
    if (!translationKey) return;

    try {
      await deleteMutation.mutateAsync(translationKey.id);
      onClose();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to delete translation key:', error);
    }
  };

  if (!isOpen || !translationKey) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-stone-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100">
                Delete Translation Key
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-stone-400 hover:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              Are you sure you want to delete this translation key? This action cannot be undone.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Key:</span>
                  <span className="ml-2 text-sm text-red-700 dark:text-red-300 font-mono">
                    {translationKey.key}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Category:</span>
                  <span className="ml-2 text-sm text-red-700 dark:text-red-300">
                    {translationKey.category}
                  </span>
                </div>
                {translationKey.description && (
                  <div>
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Description:</span>
                    <span className="ml-2 text-sm text-red-700 dark:text-red-300">
                      {translationKey.description}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Translations:</span>
                  <span className="ml-2 text-sm text-red-700 dark:text-red-300">
                    {Object.keys(translationKey.translations).length} language(s) will be deleted
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
              <strong>Warning:</strong> This will permanently delete the translation key and all its translations across all languages.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 dark:bg-stone-700 dark:text-stone-300 dark:border-stone-600 dark:hover:bg-stone-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Key
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}