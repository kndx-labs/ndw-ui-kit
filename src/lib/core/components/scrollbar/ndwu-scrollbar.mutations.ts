// `full`: recalculate everything.
// `check`: recalculate only if the content scroll size changed since the last measurement.
export type NdwuMutationRecalc = 'full' | 'check';

// Adding or removing a node can change the content size unnoticed by any observer
// (e.g. removing the widest element), so it always needs a full recalculation.
// A text or attribute change only needs a size check: growth shows up in the scroll size,
// and a shrink is reported by ResizeObserver on the children or caught by the full
// recalculation once mutations settle.
export function resolveMutationRecalc(records: ReadonlyArray<Pick<MutationRecord, 'type'>>): NdwuMutationRecalc {
  return records.some(record => record.type === 'childList') ? 'full' : 'check';
}
