interface SourceContext {
  args: Record<string, unknown>;
}

const PROPERTY_BINDING = /\s\[(\w+)\]="\1"/g;
const EVENT_BINDING = /\s\((\w+)\)="\1\(\$event\)"/g;
const INTERPOLATION = /\{\{\s*(\w+)\s*\}\}/g;

const toAttribute = (name: string, value: unknown): string => {
  if (typeof value === 'string') {
    return value === '' ? '' : ` ${name}="${value.replaceAll('"', '&quot;')}"`;
  }

  if (value === true || typeof value === 'number') {
    return ` [${name}]="${String(value)}"`;
  }

  return '';
};

const toText = (value: unknown): string => {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
};

export const argsSourceTransform = (code: string, {args}: SourceContext): string => {
  return code
    .replace(PROPERTY_BINDING, (_binding, name: string) => toAttribute(name, args[name]))
    .replace(EVENT_BINDING, '')
    .replace(INTERPOLATION, (_interpolation, name: string) => toText(args[name]));
};
