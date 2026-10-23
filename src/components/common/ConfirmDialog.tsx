import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="instrument-card rounded-2xl max-w-sm w-full p-5 space-y-4 border-2 border-ink animate-pop">
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        <p className="text-xs text-steel leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="tactile-btn px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-ink font-mono text-xs font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`tactile-btn px-4 py-2 rounded-xl text-white font-mono text-xs font-semibold ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-cobalt hover:bg-cobalt-dark'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
