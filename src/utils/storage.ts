export const safeGet = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
export const safeSet = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } };
export const sessionId = () => {
  let id = safeGet<string>("sr.sid", "");
  if (!id) { id = crypto.randomUUID(); safeSet("sr.sid", id); }
  return id;
};
