import {NdwuScheduleArea, NdwuScheduleBlock, NdwuScheduleTimePoint, type NdwuWeekDay} from '../schedule-editor.types';
import {DAY_TO_NDM_DAY} from '../schedule-editor.constants';
import {
  AxisLabel,
  BlockRect,
  BlockTextPositionParams,
  CoordsToTimeSlotParams,
  GenerateBlockFromPointsParams,
  GetAxesTextParams,
  GetBlockRectsParams,
  GetGridBlockParams,
  GetGridLinesParams,
  GetSlotRectsParams,
  GridLine,
  ScheduleGridBlock,
  SlotRect,
  SlotRectPosition,
  SlotRectPositionParams,
} from './schedule-layout.types';
import {simplifyBlocks, subtractBlocks} from './schedule-blocks.utils';
import {
  DAYS_IN_WEEK,
  HOURS_IN_DAY,
  HOUR_LABEL_STEPS,
  MINUTES_IN_DAY,
  MINUTES_IN_SLOT,
  SLOTS_PER_HOUR,
  SLOT_RECT_CLASS,
  SLOT_RECT_SELECTED_CLASS,
} from '../ndwu-schedule-editor.constants';

export abstract class ScheduleLayout {
  public abstract getGridBlock(params: GetGridBlockParams): ScheduleGridBlock | null;

  public abstract generateBlockFromPoints(params: GenerateBlockFromPointsParams): ScheduleGridBlock;

  public abstract coordsToTimeSlot(params: CoordsToTimeSlotParams): NdwuScheduleTimePoint | null;

  public abstract getAxesText(params: GetAxesTextParams): AxisLabel[];

  public abstract getTextForBlock(block: NdwuScheduleBlock, timeAxisExtent: number): string[];

  public abstract getGridLines(params: GetGridLinesParams): GridLine[];

  protected abstract getTimeAxisGridSize(gridWidth: number, gridHeight: number): number;

  protected abstract getDayAxisGridSize(gridWidth: number, gridHeight: number): number;

  protected abstract getSlotRectPosition(params: SlotRectPositionParams): SlotRectPosition;

  protected abstract getBlockTextPositions(params: BlockTextPositionParams): BlockRect['textPositions'];

  protected abstract getTimeAxisExtent(gridBlock: ScheduleGridBlock): number;

  public getHourCellSize(gridSize: number): number {
    return gridSize / HOURS_IN_DAY;
  }

  public getDayCellSize(gridSize: number): number {
    return gridSize / DAYS_IN_WEEK;
  }

  public getHourLabelStep(hourCellSize: number, minLabelExtent: number): number {
    const step = HOUR_LABEL_STEPS.find((candidate) => hourCellSize * candidate >= minLabelExtent);
    const fallback = HOUR_LABEL_STEPS[HOUR_LABEL_STEPS.length - 1];

    return step ?? fallback ?? 1;
  }

  public timeToTimeAxisCoord(time: number, gridLength: number, axisOffset: number): number {
    return (time / MINUTES_IN_DAY) * gridLength + axisOffset;
  }

  public getTimeAxisLineCoords(slotSize: number, offset: number): number[] {
    return Array.from({length: HOURS_IN_DAY}, (_, i) => (i + 1) * slotSize + offset);
  }

  public getDayAxisLineCoords(slotSize: number, offset: number): number[] {
    return Array.from({length: DAYS_IN_WEEK}, (_, i) => (i + 1) * slotSize + offset);
  }

  public normalizePointsArea(p1: NdwuScheduleTimePoint, p2: NdwuScheduleTimePoint): NdwuScheduleArea {
    const startTime = Math.min(p1.gridTime, p2.gridTime);
    // A drag selects its end slot inclusively, so the exclusive end of the area
    // is one slot past the last selected one.
    const endTime = Math.max(p1.gridTime, p2.gridTime) + MINUTES_IN_SLOT;
    const startDay = Math.min(p1.gridDay, p2.gridDay);
    const endDay = Math.max(p1.gridDay, p2.gridDay);

    return {startTime, endTime, startDay, endDay};
  }

  public getSlotRects(params: GetSlotRectsParams): SlotRect[] {
    const {offset, gridWidth, gridHeight, weekDays, blocks} = params;
    const hourCellSize = this.getHourCellSize(this.getTimeAxisGridSize(gridWidth, gridHeight));
    const dayCellSize = this.getDayCellSize(this.getDayAxisGridSize(gridWidth, gridHeight));
    const occupied = this.getOccupiedSlots(weekDays, blocks);
    const slots: SlotRect[] = [];

    weekDays.forEach((_weekDay, dayIndex) => {
      for (let slotIndex = 0; slotIndex < HOURS_IN_DAY * SLOTS_PER_HOUR; slotIndex++) {
        const rect = this.getSlotRectPosition({offset, dayIndex, slotIndex, hourCellSize, dayCellSize});
        const selected = occupied.get(dayIndex)?.has(slotIndex) ?? false;

        slots.push({
          id: `s-${dayIndex}-${slotIndex}`,
          ...rect,
          dayIndex,
          slotIndex,
          selected,
          cssClass: selected ? SLOT_RECT_SELECTED_CLASS : SLOT_RECT_CLASS,
        });
      }
    });

    return slots;
  }

  public getBlockRects(params: GetBlockRectsParams): BlockRect[] {
    const {isFull, offset, gridWidth, gridHeight, weekDays, blocks} = params;
    const blockTextX = offset.blockText?.x ?? 0;
    const blockTextY = offset.blockText?.y ?? 0;
    const hourCellSize = this.getHourCellSize(this.getTimeAxisGridSize(gridWidth, gridHeight));
    const dayCellSize = this.getDayCellSize(this.getDayAxisGridSize(gridWidth, gridHeight));

    return blocks.map((block, i) => {
      const gridBlock = this.getGridBlock({block, weekDays, offset, gridWidth, gridHeight});
      const textArr = gridBlock
        ? this.getTextForBlock(block, this.getTimeAxisExtent(gridBlock))
        : [];

      if (gridBlock) {
        gridBlock.text = textArr;
      }

      return {
        id: `block-${i}`,
        x: gridBlock?.x ?? 0,
        y: gridBlock?.y ?? 0,
        width: gridBlock?.width ?? 0,
        height: gridBlock?.height ?? 0,
        texts: isFull ? textArr : [],
        textPositions: isFull
          ? this.getBlockTextPositions({gridBlock, hourCellSize, dayCellSize, blockTextX, blockTextY})
          : [],
      };
    }).filter((block) => block.width > 0);
  }

  public applyChange(
    params: {
      blocks: NdwuScheduleBlock[];
      p1: NdwuScheduleTimePoint;
      p2: NdwuScheduleTimePoint;
      weekDays: NdwuWeekDay[];
      isRemove?: boolean;
    },
  ): NdwuScheduleBlock[] {
    const {blocks, p1, p2, weekDays, isRemove} = params;
    const {startTime, startDay, endTime, endDay} = this.normalizePointsArea(p1, p2);

    const newBlocks: NdwuScheduleBlock[] = [];

    for (let i = startDay; i <= endDay; i++) {
      const weekDay = weekDays[i];

      if (!weekDay) {
        continue;
      }

      newBlocks.push({day: DAY_TO_NDM_DAY[weekDay.day], start: startTime, stop: endTime});
    }

    const updated = isRemove ? subtractBlocks(blocks, newBlocks) : [...blocks, ...newBlocks];

    return simplifyBlocks(updated);
  }

  protected findDayIndex(weekDays: NdwuWeekDay[], block: NdwuScheduleBlock): number {
    return weekDays.findIndex((weekDay) => DAY_TO_NDM_DAY[weekDay.day] === block.day);
  }

  private getOccupiedSlots(weekDays: NdwuWeekDay[], blocks: NdwuScheduleBlock[]): Map<number, Set<number>> {
    const occupied = new Map<number, Set<number>>();

    blocks.forEach((block) => {
      const dayIndex = this.findDayIndex(weekDays, block);

      if (dayIndex < 0) {
        return;
      }

      const startSlot = Math.floor(block.start / MINUTES_IN_SLOT);
      const endSlot = Math.ceil(block.stop / MINUTES_IN_SLOT);
      let set = occupied.get(dayIndex);

      if (!set) {
        set = new Set();
        occupied.set(dayIndex, set);
      }

      for (let i = startSlot; i < endSlot; i++) {
        set.add(i);
      }
    });

    return occupied;
  }
}
