import type { Address, AddressInput, Order, StorePublic, User } from "@/types";
import { api } from "./http";

export const accountService = {
  updateProfile: (d: Partial<Pick<User, "first_name" | "last_name" | "phone" | "marketing_opt_in">>) => api.patch<User>("/me", d),
  myStore: () => api.get<StorePublic | null>("/me/store"),
  addresses: () => api.get<Address[]>("/me/addresses"),
  addAddress: (d: AddressInput) => api.post<Address>("/me/addresses", d),
  updateAddress: (id: string, d: Partial<AddressInput>) => api.patch<Address>(`/me/addresses/${id}`, d),
  deleteAddress: (id: string) => api.del<{ detail: string }>(`/me/addresses/${id}`),
  orders: () => api.get<Order[]>("/orders/me"),
  order: (id: string) => api.get<Order>(`/orders/me/${id}`),
  cancelOrder: (id: string) => api.post<Order>(`/orders/me/${id}/cancel`),
};
