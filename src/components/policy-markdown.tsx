import Link from "next/link";
import type { ReactNode } from "react";

import type { PolicyBlock, PolicyInline } from "@/lib/content/policy-markdown";

/*
 * Draws parsed policy markdown. No hooks, so the public page renders it on
 * the server and the dashboard preview renders the same markup live.
 */

const BODY = "font-serif text-[18px] leading-[150%] text-pretty";
const LINK = "underline decoration-1 underline-offset-[3px] hover:decoration-2";

function Inline({ nodes }: { nodes: PolicyInline[] }): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case "text":
        return node.text;
      case "strong":
        return (
          <strong key={index} className="font-bold">
            <Inline nodes={node.children} />
          </strong>
        );
      case "em":
        return (
          <em key={index} className="italic">
            <Inline nodes={node.children} />
          </em>
        );
      case "link": {
        const children = <Inline nodes={node.children} />;
        /* Site paths go through the router; mail, phone and other sites open as usual. */
        return node.href.startsWith("/") ? (
          <Link key={index} href={node.href} className={LINK}>
            {children}
          </Link>
        ) : (
          <a
            key={index}
            href={node.href}
            className={LINK}
            {...(/^https?:/i.test(node.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        );
      }
    }
  });
}

export function PolicyMarkdown({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="flex flex-col gap-[18px]">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return block.level === 2 ? (
            <h2
              key={index}
              id={block.id}
              className="mt-[26px] scroll-mt-[120px] font-sans text-[22px] leading-[110%] font-bold tracking-[-0.6px] first:mt-0"
            >
              <Inline nodes={block.inline} />
            </h2>
          ) : (
            <h3
              key={index}
              id={block.id}
              className="mt-[10px] scroll-mt-[120px] font-sans text-[16px] leading-[120%] font-bold tracking-[-0.4px]"
            >
              <Inline nodes={block.inline} />
            </h3>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={index}
              className={`${BODY} flex flex-col gap-[8px] pl-[1.2em] ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-[4px]">
                  <Inline nodes={item} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={index} className={BODY}>
            <Inline nodes={block.inline} />
          </p>
        );
      })}
    </div>
  );
}
