"use client";

import { useEffect } from "react";
import { registerDialogApi } from "@/lib/dialog";
import { useDialog } from "@/components/DialogProvider";

/** Registra alert/confirm customizados para uso via muttleyAlert/muttleyConfirm. */
export default function DialogRegistrar() {
  const dialog = useDialog();

  useEffect(() => {
    registerDialogApi(dialog);
    return () => registerDialogApi(null);
  }, [dialog]);

  return null;
}
