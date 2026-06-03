"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SITE_TITLE = "Muttley";

type DialogType = "alert" | "confirm";

interface DialogState {
  open: boolean;
  type: DialogType;
  message: string;
}

interface DialogContextValue {
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    type: "alert",
    message: "",
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    setDialog((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const alert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      resolveRef.current = () => {
        resolve();
      };
      setDialog({ open: true, type: "alert", message });
    });
  }, []);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setDialog({ open: true, type: "confirm", message });
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      if (e.key === "Escape") {
        close(dialog.type === "alert");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog.open, dialog.type, close]);

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}

      {dialog.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="muttley-dialog-title"
          aria-describedby="muttley-dialog-message"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => close(dialog.type === "alert")}
          />

          <div className="relative card-surface rounded-xl shadow-2xl max-w-md w-full z-10 overflow-hidden">
            <div className="bg-blue-600 px-5 py-3">
              <h2
                id="muttley-dialog-title"
                className="text-lg font-black text-white tracking-tight"
              >
                {SITE_TITLE}
              </h2>
            </div>

            <p
              id="muttley-dialog-message"
              className="px-5 py-5 text-gray-800 dark:text-gray-100 text-sm leading-relaxed whitespace-pre-wrap"
            >
              {dialog.message}
            </p>

            <div className="flex justify-end gap-2 px-5 pb-5">
              {dialog.type === "confirm" && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {dialog.type === "confirm" ? "Confirmar" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog deve ser usado dentro de DialogProvider");
  }
  return ctx;
}
