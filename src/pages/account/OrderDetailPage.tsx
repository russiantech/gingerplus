import { useState } from "react";
import { useParams } from "react-router-dom";
import OrderView from "@/components/account/OrderView";
import { ConfirmDialog, ErrorState, PageLoader } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { accountService } from "@/services/account";
import { ApiError } from "@/services/http";

export default function OrderDetailPage() {
  useDocumentTitle("Order details");
  const { id = "" } = useParams(); const toast = useToast();
  const { data, setData, loading, error } = useAsync(() => accountService.order(id), [id]);
  const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false);
  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorState message={error ?? "Order not found"} />;
  const cancellable = data.status === "pending" && data.payment_status !== "paid";
  const cancel = async () => {
    setBusy(true);
    try { setData(await accountService.cancelOrder(id)); toast.success("Order cancelled"); setConfirm(false); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : "Could not cancel"); } finally { setBusy(false); }
  };
  return (<>
    <OrderView order={data} actions={cancellable ? <button className="btn btn-outline-danger" onClick={() => setConfirm(true)}>Cancel order</button> : undefined} />
    <ConfirmDialog show={confirm} danger busy={busy} title="Cancel this order?" message="This can't be undone. Unpaid orders can be cancelled before processing." confirmLabel="Yes, cancel order" onConfirm={cancel} onClose={() => setConfirm(false)} />
  </>);
}
