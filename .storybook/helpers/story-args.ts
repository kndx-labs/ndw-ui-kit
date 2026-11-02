import {InputSignalWithTransform, ModelSignal, OutputEmitterRef} from '@angular/core';
import {NdwuSize} from '@ndw-ui-kit/core';

type ArgOf<M> = M extends ModelSignal<infer V> ? V
  : M extends InputSignalWithTransform<infer V, infer _W> ? V
  : M extends OutputEmitterRef<infer E> ? (event: E) => void
  : never;

type ComponentArgs<T> = {
  [K in keyof T as [ArgOf<T[K]>] extends [never] ? never : K]?: ArgOf<T[K]>;
};

type ModelChangeArgs<T> = {
  [K in keyof T as T[K] extends ModelSignal<infer _V> ? `${K & string}Change` : never]?: T[K] extends
    ModelSignal<infer V> ? (value: V) => void : never;
};

export type StoryArgs<T, Extra = object> = ComponentArgs<T> & ModelChangeArgs<T> & Extra;

export interface SizeArg {
  size?: NdwuSize | undefined;
}
