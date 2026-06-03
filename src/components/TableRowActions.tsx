"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

interface TableRowActionsProps {
  onView: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

export default function TableRowActions({ onView, onDelete, onEdit }: TableRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1 shrink-0">
      <button
        type="button"
        onClick={onView}
        title="Ver detalhes"
        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
      >
        <Eye className="w-5 h-5" />
      </button>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Editar"
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        title="Excluir"
        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
