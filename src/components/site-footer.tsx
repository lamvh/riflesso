import Link from "next/link"

import { getSiteSettings } from "@/lib/content/public-site-content"
import { isPartShown, type HideablePart } from "@/lib/content/site-visibility"

type FooterLink = { label: string; href: string }

const BOLD_LINK =
  "font-sans text-[14px] leading-[94%] font-bold tracking-[-0.5px] hover:underline"
const SERIF_LINK = "font-serif text-[15px] leading-[100%] hover:underline"

/** Each page link leaves the footer when its page is hidden. */
const PAGE_LINKS: (FooterLink & { part: HideablePart })[] = [
  { label: "About", href: "/about", part: "page:about" },
  { label: "Contact", href: "/contact", part: "page:contact" },
]

const LEGAL_LINKS: FooterLink[] = [
  { label: "Do Not Sell", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Site Credits", href: "#" },
]

const POLICY_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
]

function FooterColumn({
  links,
  linkClassName,
  align = "left",
  children,
}: {
  links: FooterLink[]
  linkClassName: string
  align?: "left" | "right"
  children?: React.ReactNode
}) {
  return (
    <ul
      className={`m-0 flex list-none flex-col gap-[12px] p-0 sm:gap-[9px] ${
        align === "right" ? "sm:text-right" : ""
      }`}
    >
      {links.map((link) => (
        <li key={link.label}>
          {link.href.startsWith("/") ? (
            <Link href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ) : (
            <a href={link.href} className={linkClassName}>
              {link.label}
            </a>
          )}
        </li>
      ))}
      {children}
    </ul>
  )
}

/**
 * One margin for every screen, as the merged design specifies. Social links
 * and the copyright line come from Site settings.
 *
 * From `sm` up the four columns spread across one row, the copyright closing
 * the right-hand one. On a phone they settle into two even columns — pages
 * beside social, legal beside policy — and the copyright takes its own line
 * under a hairline, rather than four columns wrapping wherever they fall.
 */
export async function SiteFooter() {
  const settings = await getSiteSettings()
  const { socialLinks, copyright } = settings
  const pageLinks = PAGE_LINKS.filter((link) => isPartShown(settings, link.part))

  return (
    <footer className="mt-[110px] grid grid-cols-2 items-start gap-x-6 gap-y-9 px-5 pb-[calc(40px+env(safe-area-inset-bottom))] sm:flex sm:flex-wrap sm:justify-between sm:gap-10 sm:pb-10">
      <FooterColumn links={pageLinks} linkClassName={BOLD_LINK} />
      <FooterColumn
        links={isPartShown(settings, "footer:social") ? socialLinks : []}
        linkClassName={BOLD_LINK}
      />
      <FooterColumn links={LEGAL_LINKS} linkClassName={SERIF_LINK} />
      <FooterColumn
        links={POLICY_LINKS}
        linkClassName={SERIF_LINK}
        align="right"
      >
        {copyright && (
          <li className="hidden sm:list-item">
            <p className="font-serif text-[15px] leading-[100%]">{copyright}</p>
          </li>
        )}
      </FooterColumn>
      {copyright && (
        <p className="col-span-2 border-t border-black/10 pt-5 font-serif text-[15px] leading-[100%] sm:hidden">
          {copyright}
        </p>
      )}
    </footer>
  )
}
