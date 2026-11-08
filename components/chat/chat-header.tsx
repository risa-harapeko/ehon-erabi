'use client';

import { BookOpen, Library, Plus } from 'lucide-react';

type ChatHeaderProps = {
  onNewConversation: () => void;
  onOpenBookshelf: () => void;
  disabled: boolean;
};

export function ChatHeader({
  onNewConversation,
  onOpenBookshelf,
  disabled,
}: ChatHeaderProps) {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-brand-100 bg-white/90 px-3 py-2 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="truncate text-lg font-bold text-ink">えほんえらび</h1>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenBookshelf}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 text-sm font-medium text-ink transition hover:bg-brand-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <Library className="h-4 w-4" aria-hidden="true" />
          本棚
        </button>
        <button
          type="button"
          onClick={onNewConversation}
          disabled={disabled}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-leaf-600 bg-white px-3 text-sm font-medium text-leaf-700 transition hover:bg-leaf-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          新しい会話
        </button>
      </div>
    </header>
  );
}
