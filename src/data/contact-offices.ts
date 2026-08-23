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
    heading: "Ho Chi Minh City",
    address: ["42 Nguyen Hue Boulevard, District 1", "Ho Chi Minh City"],
    tel: "Tel +84 (28) 3822 4477",
    email: "hello@riflesso.studio",
  },
  {
    heading: "Hanoi",
    address: ["18 Ly Thuong Kiet, Hoan Kiem District", "Hanoi"],
    tel: "Tel +84 (24) 3936 5510",
    email: "hanoi@riflesso.studio",
  },
  {
    heading: "Bookings",
    lead: "For editorial, campaign and runway bookings please contact",
    email: "bookings@riflesso.studio",
  },
  {
    heading: "Careers",
    email: "careers@riflesso.studio",
  },
  {
    heading: "New Business Inquiries",
    email: "newbusiness@riflesso.studio",
  },
  {
    heading: "Brand Partnerships",
    email: "partnerships@riflesso.studio",
    contactOnly: true,
  },
  {
    heading: "Press",
    lead: "For press requests and image licensing please contact",
    email: "press@riflesso.studio",
  },
  {
    heading: "Studio Rental",
    lead: "For availability at our Ho Chi Minh City studio please contact",
    email: "studio@riflesso.studio",
  },
  {
    heading: "Representation",
    link: { label: "Submit your Portfolio Here", href: "#" },
  },
];
