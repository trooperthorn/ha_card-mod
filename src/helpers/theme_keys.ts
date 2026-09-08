// Older theme key names that still resolve to a current card-mod type.
export const THEME_TYPE_ALIASES: Record<string, string[]> = {
  tools: ["developer-tools"],
};

export function theme_key_names(type: string): string[] {
  return [type, ...(THEME_TYPE_ALIASES[type] ?? [])];
}
