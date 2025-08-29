export function parseValue(value: string): any {
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed === "object" ||
      typeof parsed === "boolean" ||
      parsed === null
    ) {
      return parsed;
    }
  } catch {}

  return value;
}
