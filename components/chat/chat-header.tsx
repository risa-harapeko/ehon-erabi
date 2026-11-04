'use client';

import { BookOpen, Plus } from 'lucide-react';

type ChatHeaderProps = {
  onNewConversation: () => void;
  disabled: boolean;
};

export function ChatHeader({ onNewConversation, disabled }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-100 bg-white/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold text-ink">えほんえらび</h1>
      </div>
      <button
        type="button"
        onClick={onNewConversation}
        disabled={disabled}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-leaf-600 bg-white px-4 text-sm font-medium text-leaf-700 transition hover:bg-leaf-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        新しい会話
      </button>
    </header>
  );
}
