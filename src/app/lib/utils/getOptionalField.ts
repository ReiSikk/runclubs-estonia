export default function getOptionalField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (!value || value === null) return undefined;
  const strValue = value.toString().trim();
  return strValue.length > 0 ? strValue : undefined;
}