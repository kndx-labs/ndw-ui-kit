import {NdwuScheduleBlock, NdwuScheduleTimePoint} from '../schedule-editor.types';
import {minutesToHourShort, minutesToTime} from './schedule-blocks.utils';
import {ScheduleLayout} from './schedule.layout';
import {
  AxisLabel,
  BlockRect,
  BlockTextPositionParams,
  CoordsToTimeSlotParams,
  GenerateBlockFromPointsParams,
  GetAxesTextParams,
  GetGridBlockParams,
  GetGridLinesParams,
  GridLine,
  ScheduleGridBlock,
  SlotRectPosition,
  SlotRectPositionParams,
} from './schedule-layout.types';
import {
  AXIS_LABEL_DAY_CLASS,
  AXIS_LABEL_HOUR_CLASS,
  DAYS_IN_WEEK,
  HOURS_IN_DAY,
  MINUTES_IN_DAY,
  MINUTES_IN_HOUR,
  MINUTES_IN_SLOT,
  MIN_BLOCK_TEXT_MOBILE_PX,
  MIN_HOUR_LABEL_HEIGHT_PX,
  MIN_HOUR_LABEL_SHORT_HEIGHT_PX,
  SLOTS_PER_HOUR,
} from '../ndwu-schedule-editor.constants';

export class MobileScheduleLayout extends ScheduleLayout {
  public getGridBlock(params: GetGridBlockParams): ScheduleGridBlock | null {
    const {block, weekDays, offset, gridWidth, gridHeight, text} = params;
    const dayIndex = this.findDayIndex(weekDays, block);

    if (dayIndex < 0) {
      return null;
    }

    const timeCoord = this.timeToTimeAxisCoord(block.start, gridHeight, offset.top);
    const length = block.stop - block.start;
    const dayCellSize = this.getDayCellSize(gridWidth);

    const gridBlock: ScheduleGridBlock = {
      x: dayIndex * dayCellSize + offset.left,
      y: timeCoord,
      width: gridWidth / DAYS_IN_WEEK,
      height: (length / MINUTES_IN_DAY) * gridHeight,
    };

    if (text) {
      gridBlock.text = text;
    }

    return gridBlock;
  }

  public generateBlockFromPoints(params: GenerateBlockFromPointsParams): ScheduleGridBlock {
    const {p1, p2, offset, gridWidth, gridHeight} = params;
    const {startTime, startDay, endTime, endDay} = this.normalizePointsArea(p1, p2);

    const y = this.timeToTimeAxisCoord(startTime, gridHeight, offset.top);
    const timeEnd = this.timeToTimeAxisCoord(endTime, gridHeight, offset.top);
    const gridBottom = offset.top + gridHeight;
    const height = timeEnd < gridBottom ? timeEnd - y : gridBottom - y;
    const dayCellSize = this.getDayCellSize(gridWidth);
    const x = startDay * dayCellSize + offset.left;
    const width = (endDay - startDay + 1) * dayCellSize;

    return {x, y, width, height};
  }

  public coordsToTimeSlot(params: CoordsToTimeSlotParams): NdwuScheduleTimePoint | null {
    const {svgPoint, offset, canvasWidth, gridWidth, gridHeight} = params;
    const horizontalBound = canvasWidth - offset.right;
    const x = svgPoint.x < horizontalBound ? svgPoint.x : horizontalBound - 1;
    const y = svgPoint.y;

    const gridX = x - offset.left;
    const gridY = y - offset.top;
    const dayCellSize = this.getDayCellSize(gridWidth);
    const hourCellSize = this.getHourCellSize(gridHeight);
    const dayVal = Math.floor(gridX / dayCellSize);
    const gridDay = Math.min(Math.max(dayVal, 0), DAYS_IN_WEEK - 1);
    const timeVal = Math.floor((gridY / hourCellSize) * SLOTS_PER_HOUR) * MINUTES_IN_SLOT;
    const gridTime = Math.min(Math.max(timeVal, 0), MINUTES_IN_DAY + 1);

    return {gridTime, gridDay};
  }

  public getAxesText(params: GetAxesTextParams): AxisLabel[] {
    const {isFullMode, weekDays, weekdayLabels, offset, gridWidth, gridHeight} = params;
    const texts: AxisLabel[] = [];

    const hourCellSize = gridHeight / HOURS_IN_DAY;
    const dayCellSize = this.getDayCellSize(gridWidth);
    const timeLineCoords = this.getTimeAxisLineCoords(hourCellSize, offset.top);
    const dayLineCoords = this.getDayAxisLineCoords(dayCellSize, offset.left);
    const hourLabelStep = this.getHourLabelStep(
      hourCellSize,
      isFullMode ? MIN_HOUR_LABEL_HEIGHT_PX : MIN_HOUR_LABEL_SHORT_HEIGHT_PX,
    );

    dayLineCoords.forEach((lineX, index) => {
      if (index >= DAYS_IN_WEEK) {
        return;
      }

      const weekDay = weekDays[index];

      if (!weekDay) {
        return;
      }

      const label = weekdayLabels[weekDay.day] ?? String(weekDay.day);
      const labelsTopOffset = offset.labelsTopOffset ?? {x: 0, y: 0};

      texts.push({
        id: `axisLabel-${texts.length}`,
        x: lineX - dayCellSize / 2,
        y: offset.top + labelsTopOffset.y,
        text: label,
        anchor: 'middle',
        alignment: 'central',
        cssClass: AXIS_LABEL_DAY_CLASS,
      });
    });

    timeLineCoords.forEach((lineY, index) => {
      const isLabelledHour = !((index + 1) % hourLabelStep) && (index + 1) < HOURS_IN_DAY;

      if (isLabelledHour) {
        const labelsLeftOffset = offset.labelsLeftOffset ?? {x: 0, y: 0};
        const labelsRightOffset = offset.labelsRightOffset ?? {x: 0, y: 0};
        const yPos = lineY;
        const hourText = isFullMode
          ? minutesToTime((index + 1) * MINUTES_IN_HOUR)
          : minutesToHourShort((index + 1) * MINUTES_IN_HOUR);

        texts.push({
          id: `axisLabel-${texts.length}`,
          x: offset.left + labelsLeftOffset.x,
          y: yPos,
          text: hourText,
          anchor: 'end',
          alignment: 'central',
          cssClass: AXIS_LABEL_HOUR_CLASS,
        });

        texts.push({
          id: `axisLabel-${texts.length}`,
          x: offset.left + gridWidth + labelsRightOffset.x,
          y: yPos,
          text: hourText,
          anchor: 'start',
          alignment: 'central',
          cssClass: AXIS_LABEL_HOUR_CLASS,
        });
      }
    });

    return texts;
  }

  public getTextForBlock(block: NdwuScheduleBlock, timeAxisExtent: number): string[] {
    if (timeAxisExtent < MIN_BLOCK_TEXT_MOBILE_PX) {
      return [];
    }

    return [minutesToTime(block.start), minutesToTime(block.stop)];
  }

  public getGridLines(params: GetGridLinesParams): GridLine[] {
    const {isFull, offset, gridWidth, gridHeight} = params;
    const lines: GridLine[] = [];

    const hourCellSize = gridHeight / HOURS_IN_DAY;
    const dayCellSize = this.getDayCellSize(gridWidth);
    const timeCoords = this.getTimeAxisLineCoords(hourCellSize, offset.top);
    const dayCoords = this.getDayAxisLineCoords(dayCellSize, offset.left);

    dayCoords.forEach((pos, i) => {
      lines.push({
        id: `d${i}`,
        x1: pos,
        x2: pos,
        y1: offset.top,
        y2: gridHeight + offset.top,
        classes: 'ndwu-schedule-editor__grid',
      });
    });

    timeCoords.forEach((pos, i) => {
      const hour = i + 1;
      const isAccent = !(hour % 3) && hour < HOURS_IN_DAY;

      if (isAccent) {
        lines.push({
          id: `t${i}`,
          x1: offset.left,
          x2: gridWidth + offset.left,
          y1: pos,
          y2: pos,
          classes: 'ndwu-schedule-editor__grid ndwu-schedule-editor__grid--accent',
        });
      } else if (isFull && hour < HOURS_IN_DAY) {
        lines.push({
          id: `t${i}`,
          x1: offset.left,
          x2: gridWidth + offset.left,
          y1: pos,
          y2: pos,
          classes: 'ndwu-schedule-editor__grid',
          dasharray: '4 4',
        });
      }

      if (isFull) {
        const half = hourCellSize / 2;

        lines.push({
          id: `th${i}`,
          x1: offset.left,
          x2: gridWidth + offset.left,
          y1: pos - half,
          y2: pos - half,
          classes: 'ndwu-schedule-editor__grid',
          dasharray: '4 4',
        });
      }
    });

    return lines;
  }

  protected getTimeAxisGridSize(_gridWidth: number, gridHeight: number): number {
    return gridHeight;
  }

  protected getDayAxisGridSize(gridWidth: number): number {
    return gridWidth;
  }

  protected getSlotRectPosition(params: SlotRectPositionParams): SlotRectPosition {
    const {offset, dayIndex, slotIndex, hourCellSize, dayCellSize} = params;

    return {
      x: offset.left + dayIndex * dayCellSize,
      y: offset.top + slotIndex * (hourCellSize / SLOTS_PER_HOUR),
      width: dayCellSize,
      height: hourCellSize / SLOTS_PER_HOUR,
    };
  }

  protected getBlockTextPositions(params: BlockTextPositionParams): BlockRect['textPositions'] {
    const {gridBlock, dayCellSize, hourCellSize, blockTextX, blockTextY} = params;
    const baseX = (gridBlock?.x ?? 0) + dayCellSize / 2 + blockTextX;
    const baseY = (gridBlock?.y ?? 0) + hourCellSize / 4 + blockTextY;

    return (gridBlock?.text ?? []).map((_, index) => {
      const y = baseY + index * (hourCellSize / 2);

      return {x: baseX, y, anchor: 'middle'};
    });
  }

  protected getTimeAxisExtent(gridBlock: ScheduleGridBlock): number {
    return gridBlock.height;
  }
}

export const scheduleLayoutMobileUtils = new MobileScheduleLayout();
