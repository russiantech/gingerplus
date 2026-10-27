import { useState } from "react";
import { Input, Spinner, Switch } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useDocumentTitle } from "@/hooks";
import { accountService } from "@/services/account";
import { authService } from "@/services/auth";
import { ApiError } from "@/services/http";

export default function ProfilePage() {
  useDocumentTitle("Profile");
  const { user, setUser } = useAuth(); const toast = useToast();
  const [p, setP] = useState({ first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", phone: user?.phone ?? "", marketing_opt_in: !!user?.marketing_opt_in });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState<"p" | "w" | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy("p");
    try { setUser(await accountService.updateProfile(p)); toast.success("Profile updated"); } catch (x) { toast.error(x instanceof ApiError ? x.message : "Failed"); } finally { setBusy(null); }
  };
  const savePw = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy("w");
    try { await authService.changePassword(pw.current, pw.next); setPw({ current: "", next: "" }); toast.success("Password changed"); } catch (x) { toast.error(x instanceof ApiError ? x.message : "Failed"); } finally { setBusy(null); }
  };
  return (
    <div className="row g-4">
      <div className="col-xl-7"><div className="card border-0 shadow-soft"><div className="card-body p-4"><h5 className="fw-bold mb-3">Profile</h5>
        <form onSubmit={saveProfile}>
          <div className="row"><div className="col-md-6"><Input label="First name" required value={p.first_name} onChange={(e) => setP({ ...p, first_name: e.target.value })} /></div>
            <div className="col-md-6"><Input label="Last name" value={p.last_name} onChange={(e) => setP({ ...p, last_name: e.target.value })} /></div></div>
          <Input label="Email" value={user?.email ?? ""} disabled hint="Email can't be changed." />
          <Input label="Phone" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} />
          <Switch label="Email me recipes, offers and news" checked={p.marketing_opt_in} onChange={(v) => setP({ ...p, marketing_opt_in: v })} />
          <button className="btn btn-primary" disabled={busy === "p"}>{busy === "p" && <Spinner size="sm" className="me-2" />}Save changes</button></form></div></div></div>
      <div className="col-xl-5"><div className="card border-0 shadow-soft"><div className="card-body p-4"><h5 className="fw-bold mb-3">Change password</h5>
        <form onSubmit={savePw}><Input label="Current password" type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          <Input label="New password" type="password" required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" hint="8+ characters with a letter and a number." />
          <button className="btn btn-dark" disabled={busy === "w"}>{busy === "w" && <Spinner size="sm" className="me-2" />}Update password</button></form></div></div></div>
    </div>
  );
}
