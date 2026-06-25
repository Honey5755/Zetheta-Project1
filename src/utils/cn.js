/**
 * Join truthy class-name fragments into a single space-separated string.
 * A tiny `classnames` replacement so we avoid an extra dependency.
 *
 * @param {...(string | false | null | undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
