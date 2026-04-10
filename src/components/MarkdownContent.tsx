import { Fragment, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function normalizeSource(content: string): string {
  return content
    .replace(/\r\n?/g, '\n')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

function renderInline(content: string, keyPrefix: string): ReactNode[] {
  return content
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((segment, index) => {
      const key = `${keyPrefix}-${index}`;

      if (segment.startsWith('**') && segment.endsWith('**')) {
        return <strong key={key}>{segment.slice(2, -2)}</strong>;
      }

      if (segment.startsWith('*') && segment.endsWith('*')) {
        return <em key={key}>{segment.slice(1, -1)}</em>;
      }

      return <Fragment key={key}>{segment}</Fragment>;
    });
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const normalized = normalizeSource(content);

  if (!normalized) {
    return null;
  }

  const lines = normalized.split('\n');
  const blocks: ReactNode[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const currentLine = lines[lineIndex]?.trim() ?? '';

    if (!currentLine) {
      lineIndex += 1;
      continue;
    }

    const headingMatch = currentLine.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const hashes = headingMatch[1] ?? '#';
      const level = hashes.length;
      const text = headingMatch[2] ?? '';
      const headingClassName =
        level === 1
          ? 'text-3xl font-black tracking-tight'
          : level === 2
            ? 'text-2xl font-bold tracking-tight'
            : 'text-xl font-semibold tracking-tight';

      blocks.push(
        <div key={`heading-${lineIndex}`} className={headingClassName}>
          {renderInline(text, `heading-${lineIndex}`)}
        </div>
      );
      lineIndex += 1;
      continue;
    }

    if (/^[-*]\s+/.test(currentLine)) {
      const items: ReactNode[] = [];
      const listIndex = lineIndex;

      while (lineIndex < lines.length) {
        const bulletLine = lines[lineIndex]?.trim() ?? '';
        if (!/^[-*]\s+/.test(bulletLine)) {
          break;
        }

        items.push(
          <li key={`bullet-${lineIndex}`}>
            {renderInline(bulletLine.replace(/^[-*]\s+/, ''), `bullet-${lineIndex}`)}
          </li>
        );
        lineIndex += 1;
      }

      blocks.push(
        <ul key={`list-${listIndex}`} className="ml-6 list-disc space-y-2">
          {items}
        </ul>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    const paragraphIndex = lineIndex;

    while (lineIndex < lines.length) {
      const paragraphLine = lines[lineIndex]?.trim() ?? '';

      if (!paragraphLine) {
        lineIndex += 1;
        break;
      }

      if (/^(#{1,3})\s+/.test(paragraphLine) || /^[-*]\s+/.test(paragraphLine)) {
        break;
      }

      paragraphLines.push(paragraphLine);
      lineIndex += 1;
    }

    blocks.push(
      <p key={`paragraph-${paragraphIndex}`} className="leading-relaxed">
        {paragraphLines.map((paragraphLine, paragraphLineIndex) => (
          <Fragment key={`paragraph-line-${paragraphIndex}-${paragraphLineIndex}`}>
            {paragraphLineIndex > 0 ? <br /> : null}
            {renderInline(paragraphLine, `paragraph-${paragraphIndex}-${paragraphLineIndex}`)}
          </Fragment>
        ))}
      </p>
    );
  }

  return <div className={cn('space-y-4', className)}>{blocks}</div>;
}
