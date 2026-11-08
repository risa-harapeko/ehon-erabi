'use client';

import { useCallback, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { GripVertical, X } from 'lucide-react';
import {
  bookKey,
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

const SHELVES: { id: ShelfId; label: string }[] = [
  { id: 'want', label: '読みたい' },
  { id: 'read', label: '読んだ' },
];

const shelfLabel = (id: UniqueIdentifier) =>
  SHELVES.find((shelf) => shelf.id === id)?.label ?? '';

const draggedTitle = (active: { data: { current?: Record<string, any> } }) =>
  (active.data.current?.book as BookshelfItem | undefined)?.title ?? '本';

const ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `${draggedTitle(active)}をつかみました`,
  onDragOver: ({ over }) =>
    over ? `${shelfLabel(over.id)}の棚の上です` : '棚の外です',
  onDragEnd: ({ active, over }) =>
    over
      ? `${draggedTitle(active)}を${shelfLabel(over.id)}の棚に置きました`
      : `${draggedTitle(active)}を元の棚に戻しました`,
  onDragCancel: ({ active }) => `${draggedTitle(active)}を元の棚に戻しました`,
};

export function BookshelfPanel({
  open,
  items,
  onClose,
  onMove,
  onRemove,
}: BookshelfPanelProps) {
  const [activeBook, setActiveBook] = useState<BookshelfItem | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  // Shelves scrolled behind the header must not count as a drop target
  const detectShelf = useCallback<CollisionDetection>((args) => {
    const area = scrollAreaRef.current?.getBoundingClientRect();
    const pointer = args.pointerCoordinates;
    if (!area || !pointer || pointer.y < area.top || pointer.y > area.bottom) {
      return [];
    }
    return pointerWithin(args);
  }, []);

  if (!open) return null;

  function handleDragStart(event: DragStartEvent) {
    setActiveBook(event.active.data.current?.book as BookshelfItem);
  }

  function handleDragEnd(event: DragEndEvent) {
    const target = event.over?.id as ShelfId | undefined;
    if (activeBook && target && target !== activeBook.shelf) {
      onMove(activeBook.title, activeBook.author, target);
    }
    setActiveBook(null);
  }

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

      <div
        ref={scrollAreaRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          <p className="mb-3 text-xs text-ink/70">
            本をつかんで、もう一方の棚へ動かせます（スマートフォンは少し長押し）
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={detectShelf}
            accessibility={{ announcements: ANNOUNCEMENTS }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveBook(null)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SHELVES.map((shelf) => (
                <Shelf
                  key={shelf.id}
                  id={shelf.id}
                  label={shelf.label}
                  books={items.filter((item) => item.shelf === shelf.id)}
                  canDrop={activeBook !== null && activeBook.shelf !== shelf.id}
                  onMove={onMove}
                  onRemove={onRemove}
                />
              ))}
            </div>
            <DragOverlay>
              {activeBook && (
                <div className="cursor-grabbing rounded-3xl bg-white p-4 shadow-lg ring-2 ring-leaf-400">
                  <BookSummary book={activeBook} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

type ShelfProps = {
  id: ShelfId;
  label: string;
  books: BookshelfItem[];
  canDrop: boolean;
  onMove: BookshelfPanelProps['onMove'];
  onRemove: BookshelfPanelProps['onRemove'];
};

function Shelf({ id, label, books, canDrop, onMove, onRemove }: ShelfProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const headingId = `bookshelf-shelf-${id}`;

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      className={`min-h-[10rem] rounded-3xl border-2 p-3 transition-colors ${
        canDrop
          ? isOver
            ? 'border-leaf-800 bg-leaf-300 ring-4 ring-leaf-500'
            : 'border-dashed border-leaf-600 bg-leaf-200'
          : 'border-brand-100 bg-white/60'
      }`}
    >
      {canDrop && (
        // Zero height so the cards under the pointer do not shift
        <div className="sticky top-2 z-10 flex h-0 justify-end" aria-hidden="true">
          <span
            className={`h-fit rounded-full px-3 py-1 text-sm font-bold text-white shadow ${
              isOver ? 'bg-leaf-800' : 'bg-leaf-600'
            }`}
          >
            {isOver ? 'ここで離す' : 'ここに置く'}
          </span>
        </div>
      )}
      <h3
        id={headingId}
        className={`mb-3 px-1 text-base font-bold ${
          canDrop ? 'text-leaf-800' : 'text-leaf-700'
        }`}
      >
        {label}
      </h3>
      {books.length === 0 ? (
        <p className="rounded-3xl border border-brand-100 bg-white px-5 py-8 text-center text-sm text-ink/70">
          まだ本がありません
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {books.map((book) => (
            <DraggableBook
              key={bookKey(book.title, book.author)}
              book={book}
              onMove={onMove}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

type DraggableBookProps = {
  book: BookshelfItem;
  onMove: BookshelfPanelProps['onMove'];
  onRemove: BookshelfPanelProps['onRemove'];
};

function DraggableBook({ book, onMove, onRemove }: DraggableBookProps) {
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: bookKey(book.title, book.author),
    data: { book },
  });

  return (
    <li
      className={`rounded-3xl border border-leaf-100 bg-white shadow-sm ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        className="cursor-grab touch-manipulation select-none p-4 [-webkit-touch-callout:none]"
      >
        <BookSummary book={book} />
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={() =>
            onMove(
              book.title,
              book.author,
              book.shelf === 'want' ? 'read' : 'want',
            )
          }
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-leaf-600 bg-white px-4 text-sm font-medium text-leaf-700 transition hover:bg-leaf-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
        >
          {book.shelf === 'want' ? '読んだへ移す' : '読みたいへ戻す'}
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
  );
}

function BookSummary({ book }: { book: BookshelfItem }) {
  return (
    <div className="flex items-start gap-2">
      <GripVertical
        className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="break-words text-base font-bold leading-snug text-ink">
          {book.title}
        </p>
        <p className="mt-1 break-words text-sm text-ink/70">
          作者：{book.author}
        </p>
        <p className="mt-1 text-xs text-ink/50">
          記録した日：{formatRecordedAt(book.recordedAt)}
        </p>
      </div>
    </div>
  );
}
