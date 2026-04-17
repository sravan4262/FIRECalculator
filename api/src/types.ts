import type { User } from "@supabase/supabase-js";

export type AppVariables = {
  userId: string;
  user: User;
};

export interface DbPlan {
  id: string;
  user_id: string;
  name: string;
  inputs: unknown;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbTrackerCategory {
  id: string;
  user_id: string;
  label: string;
  color: string;
  sort_order: number;
}

export interface DbTrackerEntry {
  id: string;
  user_id: string;
  month: string;
  category_id: string;
  planned: string | null;
  actual: string | null;
}
