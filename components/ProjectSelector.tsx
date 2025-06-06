'use client';

import { useState } from 'react';
import { ChevronDown, Check, Folder } from 'lucide-react';
import { useProjects } from '@/hooks/useApi';
import { useCurrentProject, useLocalizationActions } from '@/store/useLocalizationStore';
import type { Project } from '@/types';

export default function ProjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const currentProject = useCurrentProject();
  const { setCurrentProject, setCurrentLanguage } = useLocalizationActions();

  const { data: projects, isLoading, error } = useProjects();

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    // Set default language to first available language
    if (project.languages.length > 0) {
      setCurrentLanguage(project.languages[0]);
    }
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse"></div>
        <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load projects
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
        Project
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-stone-400" />
          <span className="text-sm">
            {currentProject ? currentProject.name : 'Select a project'}
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
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {project.description}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {project.languages.slice(0, 3).map((lang) => (
                        <span
                          key={lang.code}
                          className="text-xs px-1.5 py-0.5 bg-stone-100 dark:bg-stone-600 rounded"
                        >
                          {lang.flag} {lang.code}
                        </span>
                      ))}
                      {project.languages.length > 3 && (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          +{project.languages.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  {currentProject?.id === project.id && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-stone-500 dark:text-stone-400">
                <p className="text-sm">No projects available</p>
                <p className="text-xs mt-1">Contact your administrator to get access</p>
              </div>
            )}
          </div>
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