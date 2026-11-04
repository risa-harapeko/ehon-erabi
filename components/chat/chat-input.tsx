'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function submit() {
    if (!canSend) return;
    onSend(value);
    setValue('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="shrink-0 border-t border-brand-100 bg-white/90 px-4 pb-3 pt-3 backdrop-blur">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mx-auto flex max-w-2xl items-end gap-2"
      >
        <div className="flex-1 rounded-3xl border border-brand-200 bg-[#fffdf9] px-4 py-2.5 transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            aria-label="メッセージ"
            placeholder="メッセージを入力"
            className="block max-h-40 w-full resize-none bg-transparent text-base leading-relaxed text-ink placeholder:text-ink/40 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={!canSend}
          aria-label="送信"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition hover:bg-brand-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
      <p className="mx-auto mt-2 hidden max-w-2xl text-xs text-ink/60 sm:block">
        Enterで送信・Shift+Enterで改行
      </p>
    </div>
  );
}
