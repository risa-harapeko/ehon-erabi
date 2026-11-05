'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import type { BookProposal, ChatMessage } from '@/lib/chat/assistant-reply';

type ChatMessageItemProps = {
  message: ChatMessage;
  showOptions: boolean;
  onSelect: (text: string) => void;
};

function AssistantAvatar() {
  return (
    <div
      aria-hidden="true"
      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-white shadow-sm"
    >
      <BookOpen className="h-4 w-4" />
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: BookProposal }) {
  return (
    <div className="rounded-3xl rounded-tl-md border border-leaf-100 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-bold text-leaf-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        おすすめの絵本
      </p>
      <h2 className="mt-2 break-words text-lg font-bold leading-snug text-ink">
        {proposal.title}
      </h2>
      <p className="mt-1 break-words text-sm text-ink/70">
        作者：{proposal.author}
      </p>
      <div className="mt-4 rounded-2xl bg-leaf-50 p-4 text-sm leading-relaxed text-ink">
        おすすめの理由：{proposal.reason}
      </div>
    </div>
  );
}

export function ChatMessageItem({
  message,
  showOptions,
  onSelect,
}: ChatMessageItemProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300">
        <p className="max-w-[80%] whitespace-pre-wrap break-words rounded-3xl rounded-br-md bg-brand-600 px-5 py-3 text-base leading-relaxed text-white shadow-sm">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300">
      <AssistantAvatar />
      <div className="flex min-w-0 max-w-[85%] flex-col gap-3">
        {message.text ? (
          <p className="w-fit max-w-full whitespace-pre-wrap break-words rounded-3xl rounded-tl-md border border-brand-100 bg-white px-5 py-3 text-base leading-relaxed text-ink shadow-sm">
            {message.text}
          </p>
        ) : null}
        {message.proposals?.map((proposal, index) => (
          <ProposalCard
            key={`${proposal.title}-${proposal.author}-${index}`}
            proposal={proposal}
          />
        ))}
        {showOptions && message.options && (
          <div className="flex flex-wrap gap-2">
            {message.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className="min-h-[44px] rounded-full border border-brand-200 bg-white px-4 py-2 text-left text-[15px] font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 motion-safe:animate-in motion-safe:fade-in duration-300"
    >
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-md border border-brand-100 bg-white px-5 py-4 shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 rounded-full bg-leaf-500 motion-safe:animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        <span className="sr-only">回答を作成中</span>
      </div>
    </div>
  );
}
