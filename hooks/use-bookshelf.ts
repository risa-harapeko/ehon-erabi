'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  findShelf,
  loadBookshelf,
  moveToShelf,
  readBookTitles,
  removeBook,
  saveBookshelf,
  toggleShelf,
  type BookshelfItem,
  type ShelfId,
} from '@/lib/bookshelf';

export function useBookshelf() {
  const [items, setItems] = useState<BookshelfItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadBookshelf());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveBookshelf(items);
  }, [hydrated, items]);

  const shelfOf = useCallback(
    (title: string, author: string) =>
      hydrated ? findShelf(items, title, author) : null,
    [hydrated, items],
  );

  const toggleWant = useCallback((title: string, author: string) => {
    setItems((prev) => toggleShelf(prev, title, author, 'want'));
  }, []);

  const toggleRead = useCallback((title: string, author: string) => {
    setItems((prev) => toggleShelf(prev, title, author, 'read'));
  }, []);

  const moveBook = useCallback(
    (title: string, author: string, shelf: ShelfId) => {
      setItems((prev) => moveToShelf(prev, title, author, shelf));
    },
    [],
  );

  const remove = useCallback((title: string, author: string) => {
    setItems((prev) => removeBook(prev, title, author));
  }, []);

  return {
    items,
    hydrated,
    shelfOf,
    toggleWant,
    toggleRead,
    moveBook,
    remove,
    readTitles: readBookTitles(items),
  };
}
