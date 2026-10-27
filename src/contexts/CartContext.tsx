import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Product, Variant } from "@/types";
import { safeGet, safeSet } from "@/utils/storage";

interface Ctx {
  lines: CartLine[]; count: number; subtotal: number; open: boolean;
  setOpen: (v: boolean) => void;
  add: (product: Product, variant: Variant, qty?: number, openDrawer?: boolean) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}
const CartCtx = createContext<Ctx>(null!);
export const useCart = () => useContext(CartCtx);
const KEY = "sr.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => safeGet<CartLine[]>(KEY, []));
  const [open, setOpen] = useState(false);
  useEffect(() => safeSet(KEY, lines), [lines]);

  const value = useMemo<Ctx>(() => ({
    lines, open, setOpen,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0),
    add: (p, v, qty = 1, openDrawer = true) => {
      setLines((cur) => {
        const ex = cur.find((l) => l.variantId === v.id);
        if (ex) return cur.map((l) => (l.variantId === v.id ? { ...l, quantity: l.quantity + qty } : l));
        return [...cur, { variantId: v.id, quantity: qty, productName: p.name, variantLabel: v.label, image: v.image_url ?? p.images[0] ?? null, unitPrice: v.effective_price ?? v.price, productSlug: p.slug }];
      });
      if (openDrawer) setOpen(true);
    },
    setQty: (id, qty) => setLines((cur) => (qty <= 0 ? cur.filter((l) => l.variantId !== id) : cur.map((l) => (l.variantId === id ? { ...l, quantity: Math.min(qty, 10000) } : l)))),
    remove: (id) => setLines((cur) => cur.filter((l) => l.variantId !== id)),
    clear: () => setLines([]),
  }), [lines, open]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
