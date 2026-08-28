export interface ComponentSetLike {
  type: string;
  name?: string;
  children?: Array<{type: string; id: string; name: string}>;
}

export interface FigmaColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}
