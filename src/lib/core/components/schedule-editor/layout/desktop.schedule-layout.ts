import {ScheduleBlock, ScheduleTimePoint} from '../schedule-editor.types';
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
  BLOCK_TEXT_GLYPH_WIDTH_PX,
  BLOCK_TEXT_INSET_PX,
  DAYS_IN_WEEK,
  HOURS_IN_DAY,
  MINUTES_IN_DAY,
  MINUTES_IN_SLOT,
  MIN_HOUR_LABEL_SHORT_WIDTH_PX,
  MIN_HOUR_LABEL_WIDTH_PX,
  SLOTS_PER_HOUR,
} from '../ndwu-schedule-editor.constants';

export class DesktopScheduleLayout extends ScheduleLayout {
  public getGridBlock(params: GetGridBlockParams): ScheduleGridBlock | null {
    const {block, weekDays, offset, gridWidth, gridHeight, text} = params;
    const dayIndex = this.findDayIndex(weekDays, block);

    if (dayIndex < 0) {
      return null;
    }

    const timeCoord = this.timeToTimeAxisCoord(block.start, gridWidth, offset.left);
    const length = block.stop - block.start;
    const dayCellSize = this.getDayCellSize(gridHeight);

    const gridBlock: ScheduleGridBlock = {
      x: timeCoord,
      y: dayIndex * dayCellSize + offset.top,
      height: gridHeight / DAYS_IN_WEEK,
      width: (length / MINUTES_IN_DAY) * gridWidth,
    };

    if (text) {
      gridBlock.text = text;
    }

    return gridBlock;
  }

  public generateBlockFromPoints(params: GenerateBlockFromPointsParams): ScheduleGridBlock {
    const {p1, p2, offset, gridWidth, gridHeight, canvasWidth} = params;
    const {startTime, startDay, endTime, endDay} = this.normalizePointsArea(p1, p2);

    const x = this.timeToTimeAxisCoord(startTime, gridWidth, offset.left);
    const timeEnd = this.timeToTimeAxisCoord(endTime, gridWidth, offset.left);
    const width = timeEnd < canvasWidth ? timeEnd - x : canvasWidth - offset.right - x;
    const dayCellSize = this.getDayCellSize(gridHeight);
    const y = startDay * dayCellSize + offset.top;
    const height = (endDay - startDay + 1) * dayCellSize;

    return {x, y, width, height};
  }

  public coordsToTimeSlot(params: CoordsToTimeSlotParams): ScheduleTimePoint | null {
    const {svgPoint, offset, canvasWidth, gridWidth, gridHeight} = params;
    const horizontalBound = canvasWidth - offset.right;
    const x = svgPoint.x < horizontalBound ? svgPoint.x : horizontalBound - 1;
    const y = svgPoint.y;

    const gridX = x - offset.left;
    const gridY = y - offset.top;
    const hourCellSize = gridWidth / HOURS_IN_DAY;
    const dayCellSize = this.getDayCellSize(gridHeight);
    const timeVal = Math.floor((gridX / hourCellSize) * SLOTS_PER_HOUR) * MINUTES_IN_SLOT;
    const gridTime = Math.min(Math.max(timeVal, 0), MINUTES_IN_DAY + 1);
    const dayVal = Math.floor(gridY / dayCellSize);
    const gridDay = Math.min(Math.max(dayVal, 0), DAYS_IN_WEEK - 1);

    return {gridTime, gridDay};
  }

  public getAxesText(params: GetAxesTextParams): AxisLabel[] {
    const {isFullMode, weekDays, weekdayLabels, offset, gridWidth, gridHeight} = params;
    const texts: AxisLabel[] = [];

    const hourCellSize = gridWidth / HOURS_IN_DAY;
    const dayCellSize = this.getDayCellSize(gridHeight);
    const timeLineCoords = this.getTimeAxisLineCoords(hourCellSize, offset.left);
    const dayLineCoords = this.getDayAxisLineCoords(dayCellSize, offset.top);
    const hourLabelStep = this.getHourLabelStep(
      hourCellSize,
      isFullMode ? MIN_HOUR_LABEL_WIDTH_PX : MIN_HOUR_LABEL_SHORT_WIDTH_PX,
    );

    timeLineCoords.forEach((lineX, index) => {
      const isLabelledHour = index > 0 && !(index % hourLabelStep);

      if (isLabelledHour) {
        texts.push({
          id: `axisLabel-${texts.length}`,
          x: lineX - hourCellSize,
          y: 1,
          text: isFullMode ? minutesToTime(index * 60) : minutesToHourShort(index * 60),
          anchor: 'middle',
          alignment: 'hanging',
          cssClass: AXIS_LABEL_HOUR_CLASS,
        });
      }
    });

    dayLineCoords.forEach((lineY, index) => {
      const weekDay = weekDays[index];

      if (!weekDay) {
        return;
      }

      const labelsLeftOffset = offset.labelsLeftOffset ?? {x: 0, y: 0};
      const labelsRightOffset = offset.labelsRightOffset ?? {x: 0, y: 0};
      const label = weekdayLabels[weekDay.day] ?? String(weekDay.day);

      texts.push({
        id: `axisLabel-${texts.length}`,
        x: offset.left + labelsLeftOffset.x,
        y: lineY - dayCellSize / 2,
        text: label,
        anchor: 'end',
        alignment: 'central',
        cssClass: AXIS_LABEL_DAY_CLASS,
      });

      if (!isFullMode) {
        texts.push({
          id: `axisLabel-${texts.length}`,
          x: gridWidth + offset.right + offset.left + labelsRightOffset.x,
          y: lineY - dayCellSize / 2,
          text: label,
          anchor: 'start',
          alignment: 'central',
          cssClass: AXIS_LABEL_DAY_CLASS,
        });
      }
    });

    return texts;
  }

  public getTextForBlock(block: ScheduleBlock, timeAxisExtent: number): string[] {
    const label = `${minutesToTime(block.start)} - ${minutesToTime(block.stop)}`;
    const requiredPx = BLOCK_TEXT_INSET_PX + label.length * BLOCK_TEXT_GLYPH_WIDTH_PX;

    return timeAxisExtent >= requiredPx ? [label] : [];
  }

  public getGridLines(params: GetGridLinesParams): GridLine[] {
    const {isFull, offset, gridWidth, gridHeight} = params;
    const lines: GridLine[] = [];

    const hourCellSize = gridWidth / HOURS_IN_DAY;
    const dayCellSize = this.getDayCellSize(gridHeight);
    const timeCoords = this.getTimeAxisLineCoords(hourCellSize, offset.left);
    const dayCoords = this.getDayAxisLineCoords(dayCellSize, offset.top);

    dayCoords.forEach((pos, i) => {
      lines.push({
        id: `d${i}`,
        x1: offset.left,
        x2: gridWidth + offset.left,
        y1: pos,
        y2: pos,
        classes: 'ndwu-schedule-editor__grid',
      });
    });

    timeCoords.forEach((pos, i) => {
      const hour = i + 1;
      const isAccent = !(hour % 3) && hour < HOURS_IN_DAY;

      if (isAccent) {
        lines.push({
          id: `t${i}`,
          x1: pos,
          x2: pos,
          y1: offset.top,
          y2: gridHeight + offset.top,
          classes: 'ndwu-schedule-editor__grid ndwu-schedule-editor__grid--accent',
        });
      } else if (isFull && hour < HOURS_IN_DAY) {
        lines.push({
          id: `t${i}`,
          x1: pos,
          x2: pos,
          y1: offset.top,
          y2: gridHeight + offset.top,
          classes: 'ndwu-schedule-editor__grid',
          dasharray: '4 4',
        });
      }

      if (isFull) {
        const half = hourCellSize / 2;

        lines.push({
          id: `th${i}`,
          x1: pos - half,
          x2: pos - half,
          y1: offset.top,
          y2: gridHeight + offset.top,
          classes: 'ndwu-schedule-editor__grid',
          dasharray: '4 4',
        });
      }
    });

    return lines;
  }

  protected getTimeAxisGridSize(gridWidth: number): number {
    return gridWidth;
  }

  protected getDayAxisGridSize(_gridWidth: number, gridHeight: number): number {
    return gridHeight;
  }

  protected getSlotRectPosition(params: SlotRectPositionParams): SlotRectPosition {
    const {offset, dayIndex, slotIndex, hourCellSize, dayCellSize} = params;

    return {
      x: offset.left + slotIndex * (hourCellSize / SLOTS_PER_HOUR),
      y: offset.top + dayIndex * dayCellSize,
      width: hourCellSize / SLOTS_PER_HOUR,
      height: dayCellSize,
    };
  }

  protected getBlockTextPositions(params: BlockTextPositionParams): BlockRect['textPositions'] {
    const {gridBlock, dayCellSize, blockTextX, blockTextY} = params;

    return (gridBlock?.text ?? []).map(() => {
      const x = (gridBlock?.x ?? 0) + blockTextX;
      const y = (gridBlock?.y ?? 0) + dayCellSize / 2 + blockTextY;

      return {x, y, anchor: 'start'};
    });
  }

  protected getTimeAxisExtent(gridBlock: ScheduleGridBlock): number {
    return gridBlock.width;
  }
}

export const scheduleLayoutDesktopUtils = new DesktopScheduleLayout();
