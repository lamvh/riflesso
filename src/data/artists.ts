import { ARTIST_IMAGES as IMG } from "./artist-images";

export const TERRITORIES = ["US", "UK"] as const;
export type Territory = (typeof TERRITORIES)[number];

export const CATEGORIES = [
  "All",
  "Hair",
  "Makeup",
  "Styling",
  "Grooming",
  "Manicure",
  "Color",
  "Set Design",
  "Digital Creators",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Artist = {
  name: string;
  /** Comma-separated disciplines, e.g. "Hair, Grooming". */
  category: string;
  image: string;
  territory: Territory;
};

const artist = (
  name: string,
  category: string,
  image: string,
  territory: Territory,
): Artist => ({ name, category, image, territory });

export const ARTISTS: Artist[] = [
  artist("Alexa Hernandez", "Makeup, Grooming", IMG.dior2, "US"),
  artist("Alice Moore", "Grooming", IMG.thr, "UK"),
  artist("Ana Tess", "Styling", IMG.whatevr, "US"),
  artist("Andy Lecompte", "Hair", IMG.voguecz, "US"),
  artist("Anne Sophie Costa", "Makeup", IMG.y3, "UK"),
  artist("Austen Turner", "Styling", IMG.flaunt2, "US"),
  artist("Avo Yermagyan", "Styling", IMG.btb, "US"),
  artist("Aya Tariq", "Makeup", IMG.glamour, "UK"),
  artist("Benjamin Puckey", "Makeup", IMG.lovewant, "US"),
  artist("Bjorn Krischker", "Hair, Grooming", IMG.repubblica, "UK"),
  artist("Brandon Tan", "Styling", IMG.cosmo, "US"),
  artist("Brooke Turnbull", "Makeup", IMG.ysl, "UK"),
  artist("Caroline Cotten", "Manicure", IMG.mac, "US"),
  artist("Charlie Riddle", "Makeup", IMG.esquire, "US"),
  artist("Charlotte Prevel", "Makeup", IMG.repubblica, "UK"),
  artist("Chelsea Zalopany", "Styling", IMG.homme, "US"),
  artist("Chris Horan", "Styling", IMG.ysl, "US"),
  artist("Diana Berry", "Makeup", IMG.gap, "US"),
  artist("Emma Day", "Makeup, Grooming", IMG.bulgari, "UK"),
  artist("Fabio Immediato", "Styling", IMG.smoda, "UK"),
  artist("Fabio Petri", "Hair, Grooming", IMG.chanelw, "UK"),
  artist("Francesca Brazzo", "Makeup", IMG.blinds, "UK"),
  artist("Georgie Eisdell", "Makeup", IMG.elle, "US"),
  artist("Gregory Russell", "Hair", IMG.elle, "US"),
  artist("Gucci Westman", "Makeup", IMG.chanel, "US"),
  artist("Halley Brisker", "Hair", IMG.bulgari, "UK"),
  artist("Harold James", "Makeup", IMG.armani, "UK"),
  artist("Issac Poleon", "Hair", IMG.vogueuk, "UK"),
  artist("James Catalano", "Hair", IMG.interview, "US"),
  artist("James Yardley", "Styling", IMG.balw2, "UK"),
  artist("Jay Hines", "Styling", IMG.sharp, "US"),
  artist("Jennifer Yepez", "Hair", IMG.armani, "US"),
  artist("Jerrod Roberts", "Hair", IMG.smoda, "US"),
  artist("Jillian Dempsey", "Makeup, Digital Creators", IMG.vanityfair, "US"),
  artist("Jillian Halouska", "Hair", IMG.ysl3, "US"),
  artist("Joey Choy", "Makeup", IMG.ysl2, "UK"),
  artist("Kate Young", "Styling, Digital Creators", IMG.lv, "US"),
  artist("Katie Qian", "Styling", IMG.nylon, "US"),
  artist("Kendra Alia", "Hair, Color, Digital Creators", IMG.miumiu, "US"),
  artist("Leith Clark", "Styling", IMG.armani2, "UK"),
  artist("Lisa Aharon", "Makeup", IMG.flaunt, "US"),
  artist("Liz Taw", "Hair, Grooming", IMG.jomalone, "UK"),
  artist("Marty Harper", "Hair, Digital Creators", IMG.vogueuk2, "UK"),
  artist("Martin Cullen", "Hair", IMG.mihara, "UK"),
  artist("Michael Fisher", "Styling", IMG.lv3, "US"),
  artist("Mimi Cuttrell", "Styling, Digital Creators", IMG.chanelw, "US"),
  artist("Mona Leanne", "Makeup, Digital Creators", IMG.diorw, "UK"),
  artist("Morgane Martini", "Makeup", IMG.rhode, "UK"),
  artist("Philipp Verheyen", "Hair, Makeup", IMG.lv2, "UK"),
  artist("Rafael Medeiros", "Set Design", IMG.bazaar, "US"),
  artist("Ricky Fraser", "Hair", IMG.vmag, "UK"),
  artist("Romane Martini", "Manicure", IMG.diorw2, "UK"),
  artist("Rose Forde", "Styling", IMG.dior, "UK"),
  artist("Rudy Martins", "Hair", IMG.numero, "US"),
  artist("Samantha McMillen", "Styling", IMG.lv, "US"),
  artist("Sasha Nesterchuk", "Hair", IMG.doublevision, "UK"),
  artist("Shameelah Hicks", "Styling", IMG.anthem, "US"),
  artist("Shayna Goldberg", "Makeup", IMG.metal, "US"),
  artist("Sky Cripps-Jackson", "Hair, Grooming", IMG.lv3, "UK"),
  artist("Sophia Sinot", "Makeup", IMG.desigual, "UK"),
  artist("Stoj", "Makeup", IMG.veronica, "US"),
  artist("Takuya Yamaguchi", "Hair", IMG.glamour, "UK"),
  artist("Yacine Diallo", "Makeup", IMG.balw, "UK"),
  artist("Zola Ganzorigt", "Manicure, Digital Creators", IMG.interview2, "US"),
];
