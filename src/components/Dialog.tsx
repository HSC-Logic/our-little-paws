import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
export function Dialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current
      ?.querySelector<HTMLElement>("button,input,select,textarea")
      ?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div
      ref={ref}
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        if (e.key === "Tab") {
          const items = Array.from(
            ref.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select,textarea,a[href]",
            ) || [],
          );
          const first = items[0],
            last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      {children}
    </div>
  );
}
