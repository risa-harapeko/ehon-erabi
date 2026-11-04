import { recommendBook, type BookConditions } from './picture-books';

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
  proposal?: BookProposal;
};

export type AssistantReply = Omit<ChatMessage, 'id' | 'role'>;

type QuestionStep = 'age' | 'interest' | 'scene';

export type ConversationState = {
  step: QuestionStep | 'result';
  answers: BookConditions;
  proposalCount: number;
};

export const INITIAL_CONVERSATION_STATE: ConversationState = {
  step: 'age',
  answers: {},
  proposalCount: 0,
};

export const MORE_BOOKS_LABEL = '別の本も見る';
export const RESTART_LABEL = '条件を変えて選び直す';

const QUESTIONS: Record<QuestionStep, AssistantReply> = {
  age: {
    text: 'お子さんの年齢を教えてください。',
    options: ['0〜2歳', '3〜4歳', '5〜6歳', '小学生'],
  },
  interest: {
    text: 'お子さんの好きなものを教えてください。',
    options: [
      '恐竜・どうぶつ・いきもの',
      'のりもの',
      '食べもの',
      '友だち・家族',
      'おもしろいお話',
      '「なぜ？」を知るお話',
      'おまかせ',
    ],
  },
  scene: {
    text: 'どんな場面で読みますか？',
    options: ['寝かしつけ', '親子での読み聞かせ', 'ひとり読み', 'おまかせ'],
  },
};

function createProposalReply(
  answers: BookConditions,
  index: number,
): AssistantReply {
  const book = recommendBook(answers, index);
  return {
    text: 'こちらの絵本はいかがでしょうか。',
    proposal: {
      title: book.title,
      author: book.author,
      reason: book.reason,
    },
    options: [MORE_BOOKS_LABEL, RESTART_LABEL],
  };
}

export function createQuestionReply(step: QuestionStep): AssistantReply {
  return QUESTIONS[step];
}

// Placeholder for the future /api/chat call: swap the body for a fetch and keep the signature.
export async function createAssistantReply(
  state: ConversationState,
  userText: string,
): Promise<{ reply: AssistantReply; state: ConversationState }> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  switch (state.step) {
    case 'age': {
      const answers = { ...state.answers, age: userText };
      return {
        reply: createQuestionReply('interest'),
        state: { step: 'interest', answers, proposalCount: 0 },
      };
    }
    case 'interest': {
      const answers = { ...state.answers, interest: userText };
      return {
        reply: createQuestionReply('scene'),
        state: { step: 'scene', answers, proposalCount: 0 },
      };
    }
    case 'scene': {
      const answers = { ...state.answers, scene: userText };
      return {
        reply: createProposalReply(answers, 0),
        state: { step: 'result', answers, proposalCount: 1 },
      };
    }
    case 'result':
      if (userText === RESTART_LABEL) {
        return {
          reply: createQuestionReply('age'),
          state: INITIAL_CONVERSATION_STATE,
        };
      }
      return {
        reply: createProposalReply(state.answers, state.proposalCount),
        state: {
          step: 'result',
          answers: state.answers,
          proposalCount: state.proposalCount + 1,
        },
      };
  }
}
