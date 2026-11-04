'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createAssistantReply,
  createQuestionReply,
  INITIAL_CONVERSATION_STATE,
  type AssistantReply,
  type ChatMessage,
  type ConversationState,
} from '@/lib/chat/assistant-reply';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessageItem, TypingIndicator } from './chat-message';

const createId = () => Math.random().toString(36).slice(2);

const toMessage = (reply: AssistantReply): ChatMessage => ({
  id: createId(),
  role: 'assistant',
  ...reply,
});

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    toMessage(createQuestionReply('age')),
  ]);
  const [conversation, setConversation] = useState<ConversationState>(
    INITIAL_CONVERSATION_STATE,
  );
  const [isWaiting, setIsWaiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isWaiting]);

  async function sendText(rawText: string) {
    const text = rawText.trim();
    if (!text || isWaiting) return;

    setMessages((prev) => [...prev, { id: createId(), role: 'user', text }]);
    setIsWaiting(true);
    try {
      const turn = await createAssistantReply(conversation, text);
      setMessages((prev) => [...prev, toMessage(turn.reply)]);
      setConversation(turn.state);
    } catch {
      setMessages((prev) => [
        ...prev,
        toMessage({
          text: 'うまく応答できませんでした。もう一度送ってみてください。',
        }),
      ]);
    } finally {
      setIsWaiting(false);
    }
  }

  function startNewConversation() {
    if (isWaiting) return;
    setMessages([toMessage(createQuestionReply('age'))]);
    setConversation(INITIAL_CONVERSATION_STATE);
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
              showOptions={index === lastIndex}
              onSelect={sendText}
            />
          ))}
          {isWaiting && <TypingIndicator />}
        </div>
      </div>
      <ChatInput onSend={sendText} disabled={isWaiting} />
    </div>
  );
}
