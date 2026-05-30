import { apiFetch } from "./api";

export const adminService = {
  listarGestores: (): Promise<any[]> => apiFetch("/admin/gestores"),
  aprovar: (id: number): Promise<void> => apiFetch(`/admin/gestores/${id}/aprovar`, { method: "PATCH" }),
  recusar: (id: number): Promise<void> => apiFetch(`/admin/gestores/${id}`, { method: "DELETE" }),
};