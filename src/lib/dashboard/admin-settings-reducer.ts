import type { ContactCardRecord } from "@/lib/content/site-content-types";

import type { SettingsAction } from "./admin-actions";
import { dropAt, note, patchAt, swap } from "./admin-helpers";
import { newId, type AdminState } from "./admin-state";

const blankContact = (): ContactCardRecord => ({
  id: newId(),
  heading: "",
  address: [],
  tel: "",
  lead: "",
  email: "",
  linkLabel: "",
  linkHref: "",
  contactOnly: false,
});

/** Brand, SEO, About copy, contact cards and footer links. */
export function settingsReducer(state: AdminState, action: SettingsAction): AdminState {
  const { settings } = state;

  switch (action.type) {
    case "settings/set":
      return { ...state, settings: { ...settings, ...action.patch } };

    case "contact/add":
      return note(
        { ...state, contacts: [...state.contacts, blankContact()] },
        "Contact card added",
      );

    case "contact/set":
      return { ...state, contacts: patchAt(state.contacts, action.index, action.patch) };

    case "contact/move":
      return { ...state, contacts: swap(state.contacts, action.index, action.delta) };

    case "contact/remove":
      return note(
        { ...state, contacts: dropAt(state.contacts, action.index) },
        `Removed ${state.contacts[action.index]?.heading || "a contact card"}`,
      );

    case "social/add":
      return {
        ...state,
        settings: { ...settings, socialLinks: [...settings.socialLinks, { label: "", href: "" }] },
      };

    case "social/set":
      return {
        ...state,
        settings: {
          ...settings,
          socialLinks: patchAt(settings.socialLinks, action.index, action.patch),
        },
      };

    case "social/remove":
      return {
        ...state,
        settings: { ...settings, socialLinks: dropAt(settings.socialLinks, action.index) },
      };
  }
}
