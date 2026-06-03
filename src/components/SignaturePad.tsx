"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onChange: (base64: string | null) => void;
}

export default function SignaturePad({ onChange }: SignaturePadProps) {
  const ref = useRef<SignatureCanvas>(null);

  const emitValue = () => {
    if (!ref.current || ref.current.isEmpty()) {
      onChange(null);
      return;
    }
    onChange(ref.current.toDataURL("image/png"));
  };

  const limpar = () => {
    ref.current?.clear();
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="field-label">Assinatura digital *</label>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Desenhe sua assinatura no quadro abaixo. Ela não poderá ser alterada depois do cadastro.
      </p>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white">
        <SignatureCanvas
          ref={ref}
          onEnd={emitValue}
          canvasProps={{
            className: "w-full h-40 touch-none",
          }}
          penColor="#1e3a8a"
        />
      </div>
      <button
        type="button"
        onClick={limpar}
        className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        Limpar assinatura
      </button>
    </div>
  );
}
