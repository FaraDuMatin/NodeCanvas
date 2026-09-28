"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  /** Start in edit mode (e.g. right after creating a node). */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onCommit: (value: string) => void;
}

/** Text that turns into an input on double-click. Enter / blur commits, Escape cancels. */
export function EditableText({ value, placeholder, multiline, className, editing, onEditingChange, onCommit }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const isEditing = draft !== null;

  useEffect(() => {
    if (editing && !isEditing) setDraft(value);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isEditing) return;
    ref.current?.focus();
    ref.current?.select();
  }, [isEditing]);

  const stop = (commit: boolean) => {
    if (commit && draft !== null && draft !== value) onCommit(draft);
    setDraft(null);
    onEditingChange?.(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") stop(false);
    if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      stop(true);
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        rows={multiline ? 3 : 1}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => stop(true)}
        onKeyDown={onKeyDown}
        className={cn("nodrag nowheel w-full resize-none bg-transparent outline-none", className)}
      />
    );
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        onEditingChange?.(true);
      }}
      className={cn("whitespace-pre-wrap break-words", !value && "text-muted-foreground/60", className)}
    >
      {value || placeholder}
    </div>
  );
}
