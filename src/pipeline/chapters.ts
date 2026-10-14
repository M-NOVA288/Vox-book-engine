export interface ChapterText {
  index: number;
  title: string;
  text: string;
}

const HEADING = /^\s*(chapter\s+[\w-]+.*|part\s+[\w-]+.*)$/im;

/**
 * Splits a manuscript into chapters: on "Chapter ..." / "Part ..." headings when present,
 * otherwise into chunks of about `wordsPerChunk` words so no single provider call is huge.
 */
export function splitIntoChapters(manuscript: string, wordsPerChunk = 2000): ChapterText[] {
  const text = manuscript.replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  if (HEADING.test(text)) {
    const parts = text.split(/^(?=\s*(?:chapter|part)\s+[\w-]+)/im).map((p) => p.trim()).filter(Boolean);
    return parts.map((p, i) => {
      const [first, ...rest] = p.split('\n');
      const isHeading = HEADING.test(first);
      return { index: i, title: isHeading ? first.trim() : `Section ${i + 1}`, text: (isHeading ? rest.join('\n') : p).trim() || first.trim() };
    });
  }

  const words = text.split(/\s+/);
  const chapters: ChapterText[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chapters.push({ index: chapters.length, title: `Part ${chapters.length + 1}`, text: words.slice(i, i + wordsPerChunk).join(' ') });
  }
  return chapters;
}
