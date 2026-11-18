/*
 * The small markdown the Policy page is written in. Deliberately tiny, so an
 * editor cannot break the page and no HTML ever reaches it:
 *
 *   ## Heading            (### for a smaller one)
 *   Paragraph text        (a blank line starts the next paragraph)
 *   - item / * item       (bulleted list)   1. item   (numbered list)
 *   **bold**  *italic*  [label](https://…, /path, #anchor, mailto:, tel:)
 *
 * Anything else is kept as plain text. Pure: parses to blocks that both the
 * public page and the dashboard preview render (components/policy-markdown.tsx).
 */

export type PolicyInline =
  | { kind: "text"; text: string }
  | { kind: "strong"; children: PolicyInline[] }
  | { kind: "em"; children: PolicyInline[] }
  | { kind: "link"; href: string; children: PolicyInline[] };

export type PolicyBlock =
  | { kind: "heading"; level: 2 | 3; id: string; text: string; inline: PolicyInline[] }
  | { kind: "paragraph"; inline: PolicyInline[] }
  | { kind: "list"; ordered: boolean; items: PolicyInline[][] };

const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

/** Addresses a link may point at; anything else renders as its label only. */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

/** "Terms of use" → "terms-of-use"; used for heading anchors (/policy#cookies). */
export function slugifyHeading(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Inline marks, read left to right; an unclosed mark stays as typed. */
export function parseInline(source: string): PolicyInline[] {
  const out: PolicyInline[] = [];
  let text = "";
  const flush = () => {
    if (text) out.push({ kind: "text", text });
    text = "";
  };

  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest);
    if (link) {
      flush();
      const children = parseInline(link[1]);
      if (SAFE_HREF.test(link[2])) out.push({ kind: "link", href: link[2], children });
      else out.push(...children);
      index += link[0].length;
      continue;
    }

    const strong = /^\*\*(.+?)\*\*/.exec(rest);
    if (strong) {
      flush();
      out.push({ kind: "strong", children: parseInline(strong[1]) });
      index += strong[0].length;
      continue;
    }

    /* Only between word boundaries, so snake_case and 2*3*4 stay as typed. */
    const em = /^[*_]([^*_\s][^*_]*?)[*_]/.exec(rest);
    const wordChar = (char: string | undefined) => Boolean(char && /[\p{L}\p{N}]/u.test(char));
    if (
      em &&
      rest[0] === rest[em[0].length - 1] &&
      !wordChar(source[index - 1]) &&
      !wordChar(source[index + em[0].length])
    ) {
      flush();
      out.push({ kind: "em", children: parseInline(em[1]) });
      index += em[0].length;
      continue;
    }

    text += source[index];
    index += 1;
  }
  flush();
  return out;
}

/** Plain text of inline nodes, for heading ids and descriptions. */
export function inlineText(nodes: PolicyInline[]): string {
  return nodes.map((node) => (node.kind === "text" ? node.text : inlineText(node.children))).join("");
}

/** Blocks of a policy body. Heading ids are unique within the page. */
export function parsePolicyMarkdown(source: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  const usedIds = new Map<string, number>();
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const closeParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ kind: "paragraph", inline: parseInline(text) });
    paragraph = [];
  };
  const closeList = () => {
    if (list?.items.length) blocks.push({ kind: "list", ordered: list.ordered, items: list.items.map(parseInline) });
    list = null;
  };
  const uniqueId = (text: string) => {
    const base = slugifyHeading(text);
    const seen = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    return seen ? `${base}-${seen + 1}` : base;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }

    const heading = HEADING.exec(line.trim());
    if (heading) {
      closeParagraph();
      closeList();
      const inline = parseInline(heading[2].trim());
      const text = inlineText(inline);
      /* A single # is the page title already; it reads as a section heading. */
      const level = heading[1].length === 3 ? 3 : 2;
      blocks.push({ kind: "heading", level, id: uniqueId(text), text, inline });
      continue;
    }

    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      closeParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) closeList();
      list ??= { ordered, items: [] };
      list.items.push(item[1].trim());
      continue;
    }

    /* An indented line right after a list item continues that item. */
    if (list && /^\s/.test(raw) && list.items.length) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }
  closeParagraph();
  closeList();
  return blocks;
}

/** The second-level headings, for the page's table of contents. */
export const policySections = (blocks: PolicyBlock[]) =>
  blocks.flatMap((block) => (block.kind === "heading" && block.level === 2 ? [{ id: block.id, text: block.text }] : []));

/** The first paragraph as plain text, for the page description. */
export function policySummary(source: string): string {
  const first = parsePolicyMarkdown(source).find((block) => block.kind === "paragraph");
  return first?.kind === "paragraph" ? inlineText(first.inline) : "";
}
