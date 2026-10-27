export const ORDER_STATUSES = ["pending", "confirmed", "processing", "dispatched", "delivered", "completed", "cancelled", "refunded"] as const;
export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"] as const;
export const CHANNELS = ["web", "whatsapp", "phone", "email", "admin", "store"] as const;
export const PAYMENT_METHODS = [
  { value: "paystack", label: "Pay online (card / transfer / USSD)" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "whatsapp", label: "Continue on WhatsApp" },
] as const;

/** Bootstrap contextual colour per status */
export const STATUS_COLOR: Record<string, string> = {
  pending: "warning", confirmed: "info", processing: "primary", dispatched: "primary", delivered: "success", completed: "success",
  cancelled: "danger", refunded: "secondary", unpaid: "danger", paid: "success", failed: "danger",
  new: "info", reviewing: "warning", approved: "success", rejected: "danger", suggested: "warning", assigned: "success", none: "secondary",
  published: "success", draft: "secondary", in_progress: "warning", resolved: "success", spam: "danger", suspended: "danger",
};

export const FLAVOR_COLOR: Record<string, string> = { turmeric: "#E8A317", honey: "#B7791F", guarana: "#5B8C3A" };
export const SUBJECTS = [
  { value: "general", label: "General Enquiry" }, { value: "wholesale", label: "Wholesale" }, { value: "distribution", label: "Distribution" },
  { value: "event", label: "Event Order" }, { value: "complaint", label: "Complaint" },
];
