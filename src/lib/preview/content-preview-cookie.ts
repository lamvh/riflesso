/** Cookie holding the token of the content a Draft Mode preview renders. */
export const PREVIEW_COOKIE = "riflesso-preview";

/** Previews are a working aid, not a share link: they lapse after a day. */
export const PREVIEW_MAX_AGE_S = 60 * 60 * 24;

export const isPreviewToken = (value: string | undefined): value is string =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
