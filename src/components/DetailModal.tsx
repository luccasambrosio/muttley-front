"use client";

import Modal from "@/components/Modal";

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
  footer?: React.ReactNode;
}

export default function DetailModal({ isOpen, onClose, title, fields, footer }: DetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <dl className="space-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
              {field.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
    </Modal>
  );
}
