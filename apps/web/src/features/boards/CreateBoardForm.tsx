"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

interface Props {
  disabled?: boolean;
  onCreate: (name: string) => void;
}

export function CreateBoardForm({ disabled, onCreate }: Props) {
  const [name, setName] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New board name"
        className="h-9 w-56 rounded-md border bg-transparent px-3 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={disabled || !name.trim()}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        <Plus className="size-4" /> Create
      </button>
    </form>
  );
}
