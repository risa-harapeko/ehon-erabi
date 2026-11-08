export type BookProposal = {
  title: string;
  author: string;
  reason: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  options?: string[];
  proposals?: BookProposal[];
};

export type AssistantReply = Omit<ChatMessage, 'id' | 'role'>;

type QuestionStep = 'age';

const QUESTIONS: Record<QuestionStep, AssistantReply> = {
  age: {
    text: 'お子さんの年齢を教えてください。',
    options: ['0〜2歳', '3〜4歳', '5〜6歳', '小学生'],
  },
};

export function createQuestionReply(step: QuestionStep): AssistantReply {
  return QUESTIONS[step];
}

export class ChatRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ChatRequestError';
    this.status = status;
  }
}

export function errorMessageForStatus(status: number): string {
  if (status === 401) return '接続設定を確認してください';
  if (status === 400) return '現在AIを利用できません';
  if (status === 404) {
    return '会話が見つかりませんでした。新しい会話を始めてください';
  }
  if (status === 429) return '少し待って再送信してください';
  return '時間をおいて再送信してください';
}

const OPTION_RE = /^\s*\d+\.\s+(.+?)\s*$/;
const TITLE_RE = /^\s*■\s*(.+?)\s*$/;
const AUTHOR_RE = /^\s*作者：\s*(.+?)\s*$/;
const REASON_RE = /^\s*おすすめの理由：\s*(.*)$/;

function flushProposal(current: Partial<BookProposal> | null): BookProposal | null {
  if (!current?.title) return null;
  return {
    title: current.title,
    author: current.author ?? '',
    reason: (current.reason ?? '').trim(),
  };
}

export function parseDifyAnswer(answer: string): AssistantReply {
  const lines = answer.replace(/\r\n/g, '\n').split('\n');
  const options: string[] = [];
  const proposals: BookProposal[] = [];
  const textLines: string[] = [];

  let current: Partial<BookProposal> | null = null;
  let collectingReason = false;

  const pushCurrent = () => {
    const proposal = flushProposal(current);
    if (proposal) proposals.push(proposal);
    current = null;
    collectingReason = false;
  };

  for (const line of lines) {
    const titleMatch = line.match(TITLE_RE);
    if (titleMatch) {
      pushCurrent();
      current = { title: titleMatch[1] };
      continue;
    }

    const authorMatch = line.match(AUTHOR_RE);
    if (authorMatch && current) {
      collectingReason = false;
      current.author = authorMatch[1];
      continue;
    }

    const reasonMatch = line.match(REASON_RE);
    if (reasonMatch && current) {
      collectingReason = true;
      current.reason = reasonMatch[1];
      continue;
    }

    const optionMatch = line.match(OPTION_RE);
    if (optionMatch) {
      pushCurrent();
      options.push(optionMatch[1]);
      continue;
    }

    if (collectingReason && current) {
      current.reason = `${current.reason ?? ''}\n${line}`;
      continue;
    }

    textLines.push(line);
  }

  pushCurrent();

  const text = textLines.join('\n').trim();
  const hasStructured = proposals.length > 0 || options.length > 0;

  return {
    text: hasStructured ? text : answer.trim(),
    options: options.length > 0 ? options : undefined,
    proposals: proposals.length > 0 ? proposals : undefined,
  };
}

export async function sendChatMessage(params: {
  query: string;
  user: string;
  conversationId: string | null;
  readBooks: string[];
}): Promise<{ reply: AssistantReply; conversationId: string | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 65_000);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        conversation_id: params.conversationId ?? '',
        user: params.user,
        read_books: params.readBooks,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ChatRequestError(
        response.status,
        errorMessageForStatus(response.status),
      );
    }

    const data = (await response.json()) as {
      answer?: unknown;
      conversation_id?: unknown;
    };

    const answer = typeof data.answer === 'string' ? data.answer : '';
    const conversationId =
      typeof data.conversation_id === 'string' && data.conversation_id
        ? data.conversation_id
        : params.conversationId;

    return {
      reply: parseDifyAnswer(answer),
      conversationId,
    };
  } catch (error) {
    if (error instanceof ChatRequestError) throw error;
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new ChatRequestError(
      timedOut ? 504 : 500,
      errorMessageForStatus(timedOut ? 504 : 500),
    );
  } finally {
    clearTimeout(timeout);
  }
}
