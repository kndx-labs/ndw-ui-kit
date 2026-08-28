export class CssUtils {
  public static tokenKeyToCssVar(key: string): string {
    return `--ndwu-${key}`;
  }

  public static resolveColorForPicker(cssVarName: string, el: HTMLElement): string | null {
    const style = getComputedStyle(el);
    let value = style.getPropertyValue(cssVarName).trim();

    if (!value) {
      value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName)
        .trim();
    }

    value = CssUtils.resolveVarExpression(value, el) ?? value;

    return CssUtils.toHexColor(value);
  }

  public static resolveVarExpression(value: string, el: HTMLElement, depth: number = 0): string | null {
    if (depth > 5) {
      return null;
    }

    const trimmed = value.trim();
    const match = trimmed.match(/^var\(\s*(--[^,\s)]+)\s*(?:,\s*([^)]+))?\)$/);

    if (!match) {
      return trimmed;
    }

    const varName = match[1] ?? '';
    const fallback = match[2]?.trim() ?? '';

    const fromEl = getComputedStyle(el)
      .getPropertyValue(varName)
      .trim();

    const documentStyle = getComputedStyle(document.documentElement);

    const fromRoot = fromEl
      ? ''
      : documentStyle.getPropertyValue(varName).trim();

    const next = (fromEl || fromRoot || fallback || '').trim();

    if (!next) {
      return null;
    }

    if (next.startsWith('var(')) {
      return CssUtils.resolveVarExpression(next, el, depth + 1);
    }

    return next;
  }

  public static toHexColor(value: string): string | null {
    const v = value.trim();

    if (!v) {
      return null;
    }

    if (v.startsWith('#')) {
      const hex = v.slice(1).trim();

      if (hex.length === 3 || hex.length === 4) {
        const r = hex[0] ?? '0';
        const g = hex[1] ?? '0';
        const b = hex[2] ?? '0';

        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
      }

      if (hex.length === 6 || hex.length === 8) {
        return `#${hex.slice(0, 6)}`.toUpperCase();
      }

      return null;
    }

    const rgbMatch = v.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i);

    if (rgbMatch) {
      const r = Math.max(0, Math.min(255, Math.round(Number(rgbMatch[1]))));
      const g = Math.max(0, Math.min(255, Math.round(Number(rgbMatch[2]))));
      const b = Math.max(0, Math.min(255, Math.round(Number(rgbMatch[3]))));
      const to2 = (n: number) => n.toString(16).padStart(2, '0');

      return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
    }

    return null;
  }
}
