/** Site-wide images editable from the admin toolbar, stored under the `images` config key. */
export type SiteImages = {
  profile: string
  favicon: string
  headerBackground: string
}

/** Bundled fallbacks, used when a key is unset or the DB is unreachable. */
export const SITE_IMAGE_DEFAULTS: SiteImages = {
  profile: '/assets/profile/profile.jpg',
  favicon: '/assets/profile/me-if-alien.png',
  headerBackground: '/assets/profile/momonosuke.jpg',
}

/** Read `images` from config; an empty or missing entry falls back to the bundled file. */
export function getSiteImages(cfg: unknown): SiteImages {
  const set = (cfg as { images?: Partial<SiteImages> }).images ?? {}
  return {
    profile: set.profile || SITE_IMAGE_DEFAULTS.profile,
    favicon: set.favicon || SITE_IMAGE_DEFAULTS.favicon,
    headerBackground: set.headerBackground || SITE_IMAGE_DEFAULTS.headerBackground,
  }
}

/** True for a local path or URL, as opposed to an icon keyword like `trophy`. */
export function isImageSrc(v: string | null | undefined): v is string {
  return !!v && /^(\/|https?:\/\/)/.test(v)
}
