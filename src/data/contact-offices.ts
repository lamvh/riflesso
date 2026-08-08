/**
 * The contact grid, shared by both About and Contact.
 *
 * Every card is a heading plus at most two paragraphs: the postal address, then
 * a block carrying the phone number, an introductory sentence, and whichever
 * link the card offers. Nothing here needs a richer shape — the design has only
 * these four ingredients.
 */
export type ContactCard = {
  heading: string;
  /** Postal address, one entry per line. */
  address?: string[];
  /** Phone number, set above the email. */
  tel?: string;
  /** Sentence that runs into the email address. */
  lead?: string;
  email?: string;
  /** A non-email link, used only by the portfolio submission card. */
  link?: { label: string; href: string };
  /** About omits this card; only Contact lists it. */
  contactOnly?: boolean;
};

export const CONTACT_CARDS: ContactCard[] = [
  {
    heading: "New York",
    address: ["304 Park Ave. South, 11th Floor", "New York, NY"],
    tel: "Tel +1 (212) 352-0777",
    email: "infoNY@thewallgroup.com",
  },
  {
    heading: "Los Angeles",
    address: ["8201 Beverly Blvd, Suite 600", "Los Angeles, CA"],
    tel: "Tel +1 (310) 276-0777",
    email: "infoLA@thewallgroup.com",
  },
  {
    heading: "London",
    address: [
      "5th Floor Arundel Street Building",
      "180 The Strand",
      "London WC2R 3DA",
    ],
    tel: "Tel +44 (0) 207 665 5524",
    email: "infoLDN@thewallgroup.com",
  },
  {
    heading: "Nashville",
    address: ["1222 Demonbreun St, Suite 1620", "Nashville, TN"],
    tel: "Tel +1 (615) 963-3000",
    email: "infoNashville@thewallgroup.com",
  },
  {
    heading: "Careers",
    email: "careers@thewallgroup.com",
  },
  {
    heading: "New Business Inquiries",
    email: "newbusiness@thewallgroup.com",
  },
  {
    heading: "Brand Partnerships",
    email: "mhunter@thewallgroup.com",
    contactOnly: true,
  },
  {
    heading: "WALL App",
    lead: "For any WALL app-related queries please contact",
    email: "WallApp@thewallgroup.com",
  },
  {
    heading: "Representation",
    link: { label: "Submit your Portfolio Here", href: "#" },
  },
];
