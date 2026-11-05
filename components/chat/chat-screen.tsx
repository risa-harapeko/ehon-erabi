'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChatRequestError,
  createQuestionReply,
  errorMessageForStatus,
  sendChatMessage,
  type AssistantReply,
  type ChatMessage,
} from '@/lib/chat/assistant-reply';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessageItem, TypingIndicator } from './chat-message';

const USER_STORAGE_KEY = 'ehon-erabi:user-id';

const createId = () => Math.random().toString(36).slice(2);

const toMessage = (reply: AssistantReply): ChatMessage => ({
  id: createId(),
  role: 'assistant',
  ...reply,
});

function readOrCreateUserId(): string {
  const existing = window.localStorage.getItem(USER_STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(USER_STORAGE_KEY, id);
  return id;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    toMessage(createQuestionReply('age')),
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restoreText, setRestoreText] = useState<string | null>(null);
  const [restoreKey, setRestoreKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    setUserId(readOrCreateUserId());
  }, []);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isWaiting, errorMessage]);

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || isWaiting || !userId) return;

    const userMessageId = createId();
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text }]);
    setIsWaiting(true);
    setErrorMessage(null);
    setRestoreText(null);

    try {
      const turn = await sendChatMessage({
        query: text,
        user: userId,
        conversationId: conversationIdRef.current,
      });
      setConversationId(turn.conversationId);
      conversationIdRef.current = turn.conversationId;
      setMessages((prev) => [...prev, toMessage(turn.reply)]);
    } catch (error) {
      const status = error instanceof ChatRequestError ? error.status : 500;
      if (status === 404) {
        setConversationId(null);
        conversationIdRef.current = null;
      }
      setMessages((prev) => prev.filter((message) => message.id !== userMessageId));
      setErrorMessage(
        error instanceof ChatRequestError
          ? error.message
          : errorMessageForStatus(status),
      );
      setRestoreText(text);
      setRestoreKey((key) => key + 1);
    } finally {
      setIsWaiting(false);
    }
  }

  function startNewConversation() {
    if (isWaiting) return;
    setMessages([toMessage(createQuestionReply('age'))]);
    setConversationId(null);
    conversationIdRef.current = null;
    setErrorMessage(null);
    setRestoreText(null);
  }

  const lastIndex = messages.length - 1;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#fff8ef] text-ink">
      <ChatHeader
        onNewConversation={startNewConversation}
        disabled={isWaiting}
      />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
          {messages.map((message, index) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              showOptions={index === lastIndex && !isWaiting}
              onSelect={sendText}
            />
          ))}
          {isWaiting && <TypingIndicator />}
        </div>
      </div>
      {errorMessage && (
        <p
          role="alert"
          className="mx-auto w-full max-w-2xl px-4 pb-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}
      <ChatInput
        onSend={sendText}
        disabled={isWaiting || !userId}
        restoreText={restoreText}
        restoreKey={restoreKey}
      />
    </div>
  );
}
