declare module '*/documentation.json' {
  const value: Parameters<typeof import('@storybook/addon-docs/angular').setCompodocJson>[0];
  export default value;
}

declare module '*.html?raw' {
  const value: string;
  export default value;
}
