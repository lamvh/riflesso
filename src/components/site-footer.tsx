import Link from "next/link";

type FooterLink = { label: string; href: string };

const BOLD_LINK =
  "font-sans text-[14px] leading-[94%] font-bold tracking-[-0.5px] hover:underline";
const SERIF_LINK = "font-serif text-[15px] leading-[100%] hover:underline";

const PAGE_LINKS: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS: FooterLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/thewallgroup" },
  { label: "TikTok", href: "https://www.tiktok.com/@thewallgroup" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Do Not Sell", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Site Credits", href: "#" },
];

const POLICY_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

function FooterColumn({
  links,
  linkClassName,
  align = "left",
  children,
}: {
  links: FooterLink[];
  linkClassName: string;
  align?: "left" | "right";
  children?: React.ReactNode;
}) {
  return (
    <ul
      className={`m-0 flex list-none flex-col gap-[9px] p-0 ${
        align === "right" ? "text-right" : ""
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
  );
}

/** One margin for every screen, as the merged design specifies. */
export function SiteFooter() {
  return (
    <footer className="mt-[110px] flex flex-wrap items-start justify-between gap-10 px-5 pb-10">
      <FooterColumn links={PAGE_LINKS} linkClassName={BOLD_LINK} />
      <FooterColumn links={SOCIAL_LINKS} linkClassName={BOLD_LINK} />
      <FooterColumn links={LEGAL_LINKS} linkClassName={SERIF_LINK} />
      <FooterColumn links={POLICY_LINKS} linkClassName={SERIF_LINK} align="right">
        <li>
          <p className="font-serif text-[15px] leading-[100%]">
            The Wall Group ©2024
          </p>
        </li>
      </FooterColumn>
    </footer>
  );
}
