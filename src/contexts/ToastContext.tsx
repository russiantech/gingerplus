import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Kind = "success" | "danger" | "info" | "warning";
interface Toast { id: number; kind: Kind; message: string }
interface Ctx { toast: (message: string, kind?: Kind) => void; success: (m: string) => void; error: (m: string) => void }
const ToastCtx = createContext<Ctx>(null!);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback((message: string, kind: Kind = "info") => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t, { id, kind, message }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  const value = useMemo(() => ({ toast, success: (m: string) => toast(m, "success"), error: (m: string) => toast(m, "danger") }), [toast]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 2000 }} aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast show align-items-center text-bg-${t.kind} border-0 mb-2`} role="alert">
            <div className="d-flex"><div className="toast-body">{t.message}</div>
              <button className="btn-close btn-close-white me-2 m-auto" onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))} aria-label="Close" /></div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
