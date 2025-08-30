export function parseValue(
  value: string
): string | number | boolean | object | any[] {
  // Quoted string → strip quotes
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  // Boolean
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  // Number
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  // JSON (object or array)
  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    try {
      return JSON.parse(value);
    } catch {}
  }

  // Fallback → raw string
  return value;
}
