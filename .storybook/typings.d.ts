declare module '*/documentation.json' {
  const value: Parameters<typeof import('@storybook/addon-docs/angular').setCompodocJson>[0];
  export default value;
}
