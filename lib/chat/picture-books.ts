export type BookConditions = {
  age?: string;
  interest?: string;
  scene?: string;
};

export type PictureBook = {
  title: string;
  author: string;
  reason: string;
  ages: string[];
  interests: string[];
  scenes: string[];
};

const ANY_LABEL = 'おまかせ';

const PICTURE_BOOKS: PictureBook[] = [
  {
    title: '（仮）ぴょんぴょんどうぶつえん',
    author: '仮の作者名A',
    reason: '動物の鳴き声をまねして楽しめるので、小さなお子さんの読み聞かせにぴったりです。',
    ages: ['0〜2歳', '3〜4歳'],
    interests: ['恐竜・どうぶつ・いきもの'],
    scenes: ['寝かしつけ', '親子での読み聞かせ'],
  },
  {
    title: '（仮）きょうりゅうのよるさんぽ',
    author: '仮の作者名B',
    reason: '静かな夜の場面が多く、寝る前にゆっくり読めるお話です。',
    ages: ['3〜4歳', '5〜6歳'],
    interests: ['恐竜・どうぶつ・いきもの', 'おもしろいお話'],
    scenes: ['寝かしつけ'],
  },
  {
    title: '（仮）はしれ！ことことでんしゃ',
    author: '仮の作者名C',
    reason: '電車の音が出てくるので、親子で声を合わせて楽しめます。',
    ages: ['0〜2歳', '3〜4歳'],
    interests: ['のりもの'],
    scenes: ['寝かしつけ', '親子での読み聞かせ'],
  },
  {
    title: '（仮）そらをとぶ・ぶーんひこうき',
    author: '仮の作者名D',
    reason: '飛行機が空を進む様子を追いかけながら、ひとりでも読みすすめやすいお話です。',
    ages: ['5〜6歳', '小学生'],
    interests: ['のりもの', 'おもしろいお話'],
    scenes: ['ひとり読み'],
  },
  {
    title: '（仮）ふしぎなごはんやさん',
    author: '仮の作者名E',
    reason: '次々に出てくる食べものが会話のきっかけになり、食事の話題にもつながります。',
    ages: ['3〜4歳', '5〜6歳'],
    interests: ['食べもの', 'おもしろいお話'],
    scenes: ['親子での読み聞かせ'],
  },
  {
    title: '（仮）ごはんのじかん',
    author: '仮の作者名F',
    reason: '食べものの場面がたくさんあり、ことばを覚えはじめた頃に楽しめます。',
    ages: ['0〜2歳'],
    interests: ['食べもの'],
    scenes: ['寝かしつけ', '親子での読み聞かせ'],
  },
  {
    title: '（仮）なかよしのおうち',
    author: '仮の作者名G',
    reason: '家族のぬくもりが感じられるやさしい場面が中心で、安心して読めます。',
    ages: ['0〜2歳', '3〜4歳'],
    interests: ['友だち・家族'],
    scenes: ['寝かしつけ', '親子での読み聞かせ'],
  },
  {
    title: '（仮）どうしてそらはあおいの？',
    author: '仮の作者名H',
    reason: '身のまわりの「なぜ？」を、絵を見ながら一緒に考えられる1冊です。',
    ages: ['5〜6歳', '小学生'],
    interests: ['「なぜ？」を知るお話'],
    scenes: ['親子での読み聞かせ', 'ひとり読み'],
  },
  {
    title: '（仮）ちきゅうのしくみずかん',
    author: '仮の作者名I',
    reason: '写真やイラストが多く、知りたい気持ちに自分で応えられる図鑑風の絵本です。',
    ages: ['小学生'],
    interests: ['「なぜ？」を知るお話'],
    scenes: ['ひとり読み'],
  },
  {
    title: '（仮）まちではたらくひとたち',
    author: '仮の作者名J',
    reason: 'いろいろな人が登場し、ごっこ遊びのきっかけにもなります。',
    ages: ['5〜6歳', '小学生'],
    interests: ['友だち・家族', 'おもしろいお話'],
    scenes: ['親子での読み聞かせ', 'ひとり読み'],
  },
  {
    title: '（仮）まほうのポケット',
    author: '仮の作者名K',
    reason: '次のページが気になる展開で、読むのがどんどん楽しくなるお話です。',
    ages: ['3〜4歳', '5〜6歳'],
    interests: ['おもしろいお話'],
    scenes: ['親子での読み聞かせ', 'ひとり読み'],
  },
  {
    title: '（仮）おやすみのくにへ',
    author: '仮の作者名L',
    reason: 'ゆったりとした言葉の流れで、眠りへの時間をやさしく包みます。',
    ages: ['0〜2歳'],
    interests: ['友だち・家族'],
    scenes: ['寝かしつけ'],
  },
  {
    title: '（仮）はじめてのなぜなぜ図鑑',
    author: '仮の作者名M',
    reason: '身近な動物の「なぜ？」が、かんたんな言葉で説明されています。',
    ages: ['3〜4歳', '5〜6歳'],
    interests: ['「なぜ？」を知るお話', '恐竜・どうぶつ・いきもの'],
    scenes: ['親子での読み聞かせ'],
  },
];

function scoreBook(book: PictureBook, conditions: BookConditions): number {
  const matches = [
    [book.ages, conditions.age],
    [book.interests, conditions.interest],
    [book.scenes, conditions.scene],
  ] as const;

  return matches.reduce((score, [candidates, answer]) => {
    if (!answer || answer === ANY_LABEL) return score;
    return candidates.includes(answer) ? score + 1 : score;
  }, 0);
}

export function recommendBook(
  conditions: BookConditions,
  index: number,
): PictureBook {
  const ranked = [...PICTURE_BOOKS].sort(
    (a, b) => scoreBook(b, conditions) - scoreBook(a, conditions),
  );
  return ranked[index % ranked.length];
}
