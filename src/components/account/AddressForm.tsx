import { useState } from "react";
import { Input, Select } from "@/components/common";
import { useAsync } from "@/hooks";
import { publicService } from "@/services/public";
import type { AddressInput } from "@/types";

export const emptyAddress = (name = "", phone = ""): AddressInput => ({ label: "Home", recipient_name: name, phone, line1: "", line2: "", city: "", state: "", lga: "", country: "Nigeria", is_default: false });

export function validateAddress(a: AddressInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (a.recipient_name.trim().length < 2) e.recipient_name = "Enter the recipient's name";
  if (!/^[+\d][\d\s-]{7,}$/.test(a.phone.trim())) e.phone = "Enter a valid phone number";
  if (a.line1.trim().length < 4) e.line1 = "Enter the street address";
  if (!a.city.trim()) e.city = "Enter the city / area";
  if (!a.state) e.state = "Select a state";
  return e;
}

/** Controlled address fields — used in checkout (guest inline + modal) and the address book. */
export default function AddressForm({ value, onChange, errors = {}, showLabel = true }: { value: AddressInput; onChange: (a: AddressInput) => void; errors?: Record<string, string>; showLabel?: boolean }) {
  const { data: states } = useAsync(() => publicService.states(), []);
  const set = (patch: Partial<AddressInput>) => onChange({ ...value, ...patch });
  const [, force] = useState(0); void force;
  return (
    <div className="row g-x-3">
      <div className="col-md-6"><Input label="Recipient name" required value={value.recipient_name} onChange={(e) => set({ recipient_name: e.target.value })} error={errors.recipient_name} autoComplete="name" /></div>
      <div className="col-md-6"><Input label="Phone" required value={value.phone} onChange={(e) => set({ phone: e.target.value })} error={errors.phone} autoComplete="tel" inputMode="tel" /></div>
      <div className="col-12"><Input label="Street address" required value={value.line1} onChange={(e) => set({ line1: e.target.value })} error={errors.line1} autoComplete="address-line1" placeholder="House number and street" /></div>
      <div className="col-12"><Input label="Apartment, landmark (optional)" value={value.line2 ?? ""} onChange={(e) => set({ line2: e.target.value })} autoComplete="address-line2" /></div>
      <div className="col-md-4"><Input label="City / Area" required value={value.city} onChange={(e) => set({ city: e.target.value })} error={errors.city} autoComplete="address-level2" /></div>
      <div className="col-md-4"><Select label="State" required value={value.state} onChange={(e) => set({ state: e.target.value })} error={errors.state}>
        <option value="">Select state…</option>{(states ?? []).map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
      <div className="col-md-4"><Input label="LGA (optional)" value={value.lga ?? ""} onChange={(e) => set({ lga: e.target.value })} /></div>
      {showLabel && <div className="col-md-6"><Select label="Address label" value={value.label} onChange={(e) => set({ label: e.target.value })}><option>Home</option><option>Office</option><option>Store</option><option>Other</option></Select></div>}
    </div>
  );
}
