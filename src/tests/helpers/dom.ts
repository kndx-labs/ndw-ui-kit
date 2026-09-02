/**
 * querySelector that throws instead of returning null, so a spec can use the
 * element directly without a per-site null guard. `ctx` (usually the rule id)
 * and the selector are named in the failure message.
 */
export const must = <T extends Element>(root: ParentNode, selector: string, ctx: string): T => {
  const el = root.querySelector<T>(selector);

  if (!el) {
    throw new Error(`${ctx}: no element matched "${selector}"`);
  }

  return el;
};
