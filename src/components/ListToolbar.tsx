"use client";

import { Search, ArrowUpDown } from "lucide-react";

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortAsc: boolean;
  onSortToggle: () => void;
  placeholder?: string;
  sortLabel?: string;
}

export default function ListToolbar({
  search,
  onSearchChange,
  sortAsc,
  onSortToggle,
  placeholder = "Buscar...",
  sortLabel = "Ordenar",
}: ListToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="field-input pl-10 rounded-lg"
        />
      </div>
      <button
        type="button"
        onClick={onSortToggle}
        className="flex items-center justify-center gap-2 px-4 py-2 font-bold text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shrink-0"
      >
        <ArrowUpDown className="w-4 h-4" />
        {sortLabel} ({sortAsc ? "A→Z" : "Z→A"})
      </button>
    </div>
  );
}
