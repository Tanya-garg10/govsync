"use client";

import { ReactNode } from "react";

export function Modal({ children, onClose, wide = false }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className={`bg-white rounded-2xl w-full overflow-hidden ${wide ? "max-w-2xl" : "max-w-lg"}`}>{children}</div>
    </div>
  );
}
