'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  formatRecordedAt,
  type BookshelfItem,
  type ShelfId,
} from '@/lib/bookshelf';

type BookshelfPanelProps = {
  open: boolean;
  items: BookshelfItem[];
  onClose: () => void;
  onMove: (title: string, author: string, shelf: ShelfId) => void;
  onRemove: (title: string, author: string) => void;
};

const TABS: { id: ShelfId; label: string }[] = [
  { id: 'want', label: '読みたい' },
  { id: 'read', label: '読んだ' },
];

export function BookshelfPanel({
  open,
  items,
  onClose,
  onMove,
  onRemove,
}: BookshelfPanelProps) {
  const [tab, setTab] = useState<ShelfId>('want');

  const visible = useMemo(
    () => items.filter((item) => item.shelf === tab),
    [items, tab],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#fff8ef] text-ink"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookshelf-title"
    >
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-brand-100 bg-white/90 px-4">
        <h2 id="bookshelf-title" className="text-lg font-bold">
          わが家の本棚
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-brand-200 bg-white text-ink transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col">
        <div className="flex gap-2 px-4 pt-4">
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={selected}
                className={`min-h-[44px] flex-1 rounded-full border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 ${
                  selected
                    ? 'border-leaf-600 bg-leaf-600 text-white'
                    : 'border-leaf-200 bg-white text-leaf-700 hover:bg-leaf-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {visible.length === 0 ? (
            <p className="rounded-3xl border border-brand-100 bg-white px-5 py-8 text-center text-sm text-ink/70">
              まだ本がありません
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((book) => (
                <li
                  key={`${book.title}\u0000${book.author}`}
                  className="rounded-3xl border border-leaf-100 bg-white p-4 shadow-sm"
                >
                  <p className="break-words text-base font-bold leading-snug text-ink">
                    {book.title}
                  </p>
                  <p className="mt-1 break-words text-sm text-ink/70">
                    作者：{book.author}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    記録した日：{formatRecordedAt(book.recordedAt)}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onMove(
                          book.title,
                          book.author,
                          tab === 'want' ? 'read' : 'want',
                        )
                      }
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-leaf-600 bg-white px-4 text-sm font-medium text-leaf-700 transition hover:bg-leaf-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
                    >
                      {tab === 'want' ? '読んだへ移す' : '読みたいへ戻す'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(book.title, book.author)}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-brand-200 bg-white px-4 text-sm font-medium text-ink/80 transition hover:bg-brand-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      本棚から外す
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
