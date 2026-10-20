// `full`: release the pinned content box and measure everything again.
// `check`: compare the content scroll size with the last measured one, recalculate on a change.
export type NdwuMutationRecalc = 'full' | 'check';

// Adding or removing a node can change the content size unnoticed by any observer
// (e.g. removing the widest element), so it always needs a full recalculation.
// A text or attribute change only needs a size check: growth shows up in the scroll size,
// and a shrink is reported by ResizeObserver on the children or caught by the full
// recalculation once mutations settle.
export function resolveMutationRecalc(records: ReadonlyArray<Pick<MutationRecord, 'type'>>): NdwuMutationRecalc {
  return records.some(record => record.type === 'childList') ? 'full' : 'check';
}
