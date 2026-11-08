import { NextResponse } from 'next/server';

const MAX_QUERY_LENGTH = 2000;
const TIMEOUT_MS = 60_000;

const MAX_READ_BOOKS = 200;
const MAX_READ_BOOK_TITLE_LENGTH = 100;

type ChatRequestBody = {
  query?: unknown;
  conversation_id?: unknown;
  user?: unknown;
  read_books?: unknown;
};

function normalizeReadBooks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const titles: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const title = item.trim().slice(0, MAX_READ_BOOK_TITLE_LENGTH);
    if (!title) continue;
    titles.push(title);
    if (titles.length >= MAX_READ_BOOKS) break;
  }
  return titles;
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const query = typeof body.query === 'string' ? body.query.trim() : '';
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  }

  const conversationId =
    typeof body.conversation_id === 'string' ? body.conversation_id : '';
  const user = typeof body.user === 'string' ? body.user.trim() : '';
  if (!user) {
    return NextResponse.json({ error: 'invalid_user' }, { status: 400 });
  }

  const apiUrl = process.env.DIFY_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.DIFY_API_KEY;
  if (!apiUrl || !apiKey) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 401 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const difyResponse = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          read_books: normalizeReadBooks(body.read_books).join('\n'),
        },
        query,
        response_mode: 'blocking',
        conversation_id: conversationId,
        user,
      }),
      signal: controller.signal,
    });

    const data = (await difyResponse.json().catch(() => null)) as {
      answer?: unknown;
      conversation_id?: unknown;
      code?: unknown;
      message?: unknown;
    } | null;

    if (!difyResponse.ok) {
      console.error('Dify chat-messages error', {
        status: difyResponse.status,
        code: typeof data?.code === 'string' ? data.code : undefined,
        message: typeof data?.message === 'string' ? data.message : undefined,
      });
      return NextResponse.json(
        { error: 'upstream_error' },
        { status: difyResponse.status },
      );
    }

    return NextResponse.json({
      answer: typeof data?.answer === 'string' ? data.answer : '',
      conversation_id:
        typeof data?.conversation_id === 'string' ? data.conversation_id : '',
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: timedOut ? 'timeout' : 'upstream_error' },
      { status: timedOut ? 504 : 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
