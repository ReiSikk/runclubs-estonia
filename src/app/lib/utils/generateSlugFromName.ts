export default function normalizeToSlug(str: string): string {
  const charMap: Record<string, string> = {
    'ä': 'a', 'Ä': 'a',
    'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u',
    'õ': 'o', 'Õ': 'o',
    'š': 's', 'Š': 's',
    'ž': 'z', 'Ž': 'z',
  };

  return str
    .split('')
    .map(char => charMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}