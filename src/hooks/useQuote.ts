import { useEffect, useState } from "react";
import { shopService } from "@/services/shop";
import { ApiError } from "@/services/http";
import type { CartLine, Quote } from "@/types";

/** Debounced server quote for the current cart (tiers, promotions, coupon, delivery, wholesale rules). */
export function useQuote(lines: CartLine[], state?: string, coupon?: string) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(lines.length > 0);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify([lines.map((l) => [l.variantId, l.quantity]), state, coupon]);

  useEffect(() => {
    if (!lines.length) { setQuote(null); setLoading(false); return; }
    let alive = true; setLoading(true);
    const t = setTimeout(() => {
      shopService.quote(lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity })), state || undefined, coupon || undefined)
        .then((q) => alive && (setQuote(q), setError(null)))
        .catch((e) => alive && setError(e instanceof ApiError ? e.message : "Could not calculate your total"))
        .finally(() => alive && setLoading(false));
    }, 300);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { quote, loading, error };
}
