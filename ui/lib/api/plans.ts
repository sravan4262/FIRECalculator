import { apiFetch } from "./client";
import type { FireInputs } from "@/lib/engine/types";

export interface SavedPlan {
  id: string;
  userId: string;
  name: string;
  inputs: FireInputs;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export const plansApi = {
  list: () => apiFetch<SavedPlan[]>("/plans"),

  get: (id: string) => apiFetch<SavedPlan>(`/plans/${id}`),

  create: (name: string, inputs: FireInputs) =>
    apiFetch<SavedPlan>("/plans", {
      method: "POST",
      body: JSON.stringify({ name, inputs }),
    }),

  update: (id: string, patch: Partial<Pick<SavedPlan, "name" | "inputs" | "isPublic">>) =>
    apiFetch<SavedPlan>(`/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/plans/${id}`, { method: "DELETE" }),
};
