"use client";
import { useState } from "react";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { plansApi } from "@/lib/api/plans";
import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";
import type { FireInputs } from "@/lib/engine/types";

interface Props {
  inputs: FireInputs;
}

export function SavePlanButton({ inputs }: Props) {
  const [state, setState] = useState<"idle" | "naming" | "saving" | "saved">("idle");
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setState("saving");
    setError(null);
    try {
      await plansApi.create(name.trim(), inputs);
      setState("saved");
      setTimeout(() => { setState("idle"); setName(""); }, 2500);
    } catch (e: any) {
      setError(e.message);
      setState("naming");
    }
  };

  if (state === "saved") {
    return (
      <button className="flex items-center gap-1.5 text-xs text-success border border-success/40 rounded-lg px-3 py-1.5">
        <Check className="w-3.5 h-3.5" /> Saved!
      </button>
    );
  }

  if (state === "naming") {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setState("idle"); }}
          placeholder="Plan name…"
          className="text-xs rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 w-32 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="text-xs text-primary border border-primary/40 rounded-lg px-2.5 py-1.5 hover:bg-primary/10 disabled:opacity-40 transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setState("idle")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
        {error && <span className="text-[10px] text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => user ? setState("naming") : router.push("/auth/login")}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 rounded-lg px-3 py-1.5 transition-colors"
    >
      <BookmarkPlus className="w-3.5 h-3.5" />
      Save plan
    </button>
  );
}
