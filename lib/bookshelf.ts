export type ShelfId = 'want' | 'read';

export type BookshelfItem = {
  title: string;
  author: string;
  shelf: ShelfId;
  recordedAt: string;
};

const STORAGE_KEY = 'ehon-erabi:bookshelf';
const MAX_STORED_BOOKS = 200;

export function bookKey(title: string, author: string): string {
  return `${title}\u0000${author}`;
}

export function todayDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatRecordedAt(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
}

function isShelfId(value: unknown): value is ShelfId {
  return value === 'want' || value === 'read';
}

function parseItem(value: unknown): BookshelfItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.title !== 'string' || typeof item.author !== 'string') {
    return null;
  }
  const title = item.title.trim();
  const author = item.author.trim();
  if (!title || !isShelfId(item.shelf) || typeof item.recordedAt !== 'string') {
    return null;
  }
  return {
    title,
    author,
    shelf: item.shelf,
    recordedAt: item.recordedAt,
  };
}

export function loadBookshelf(): BookshelfItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as { books?: unknown }).books)
        ? (parsed as { books: unknown[] }).books
        : null;
    if (!list) return [];

    const byKey = new Map<string, BookshelfItem>();
    for (const entry of list) {
      const item = parseItem(entry);
      if (!item) continue;
      byKey.set(bookKey(item.title, item.author), item);
      if (byKey.size >= MAX_STORED_BOOKS) break;
    }
    return Array.from(byKey.values());
  } catch {
    return [];
  }
}

export function saveBookshelf(items: BookshelfItem[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, books: items.slice(0, MAX_STORED_BOOKS) }),
    );
  } catch {
    // localStorage may be unavailable or full
  }
}

export function findShelf(
  items: BookshelfItem[],
  title: string,
  author: string,
): ShelfId | null {
  const key = bookKey(title, author);
  return items.find((item) => bookKey(item.title, item.author) === key)?.shelf ?? null;
}

export function readBookTitles(items: BookshelfItem[]): string[] {
  return items.filter((item) => item.shelf === 'read').map((item) => item.title);
}

export function toggleShelf(
  items: BookshelfItem[],
  title: string,
  author: string,
  shelf: ShelfId,
): BookshelfItem[] {
  const trimmedTitle = title.trim();
  const trimmedAuthor = author.trim();
  if (!trimmedTitle) return items;

  const key = bookKey(trimmedTitle, trimmedAuthor);
  const current = items.find((item) => bookKey(item.title, item.author) === key);
  if (current?.shelf === shelf) {
    return items.filter((item) => bookKey(item.title, item.author) !== key);
  }

  const next: BookshelfItem = {
    title: trimmedTitle,
    author: trimmedAuthor,
    shelf,
    recordedAt: todayDate(),
  };
  const without = items.filter((item) => bookKey(item.title, item.author) !== key);
  return [...without, next].slice(-MAX_STORED_BOOKS);
}

export function moveToShelf(
  items: BookshelfItem[],
  title: string,
  author: string,
  shelf: ShelfId,
): BookshelfItem[] {
  const key = bookKey(title, author);
  let found = false;
  const next = items.map((item) => {
    if (bookKey(item.title, item.author) !== key) return item;
    found = true;
    return { ...item, shelf, recordedAt: todayDate() };
  });
  return found ? next : items;
}

export function removeBook(
  items: BookshelfItem[],
  title: string,
  author: string,
): BookshelfItem[] {
  const key = bookKey(title, author);
  return items.filter((item) => bookKey(item.title, item.author) !== key);
}
