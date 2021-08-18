/*
Copyright 2005 - 2021 Advantage Solutions, s. r. o.

This file is part of ORIGAM (http://www.origam.org).

ORIGAM is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ORIGAM is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ORIGAM. If not, see <http://www.gnu.org/licenses/>.
*/

import {
  clickSubscriptions,
  columnWidths,
  context,
  context2d,
  currentRow,
  drawingColumnIndex,
  fixedColumnCount,
  gridLeadCellDimensions,
  groupingColumnIds,
  isCheckBoxedTable,
  mouseOverSubscriptions,
  propertyById,
  realFixedColumnCount,
  rowHeight,
  rowIndex,
  scRenderCell,
  scRenderRow,
  scRenderTable,
  scrollLeft,
  scrollTop,
  tableColumnIds,
  tableRows,
  viewportHeight,
  viewportWidth,
  mouseMoveSubscriptions,setCurrentRowRightBorderDrawn,
} from "./renderingValues";
import {firstDrawableRowIndex, lastDrawableRowIndex} from "./drawableRowIndex";
import {drawCurrentCell} from "./currentCell";
import {firstDrawableColumnIndex, lastDrawableColumnIndex} from "./drawableColumnIndex";
import {IClickSubsItem, IMouseOverSubsItem, ITableRow} from "./types";
import {CPR} from "utils/canvas";
import {IProperty} from "model/entities/types/IProperty";
import {currentRowCellsDimensions, currentRowCellsDraws,} from "./currentRowCells";
import {cellLayerCount, setLayerIndex} from "./currentCellLayerIndex";
import {
  clearTableDebugValues,
  setTableDebugRendered
} from "gui/Components/ScreenElements/Table/TableRendering/DebugTableMonitor";

export function renderTable(
  aCtx: any,
  aCtx2d: CanvasRenderingContext2D,
  aTableRows: ITableRow[],
  aGroupedColumnIds: string[],
  aTableColumnIds: string[],
  aPropertyById: Map<string, IProperty>,
  aScrollLeft: number,
  aScrollTop: number,
  aViewportWidth: number,
  aViewportHeight: number,
  aIsCheckBoxedTable: boolean,
  aGridLeadCellDimensions: { left: number; width: number; right: number }[],
  aColumnWidths: Map<string, number>,
  aFixedColumnCount: number,
  aClickSubscriptions: IClickSubsItem[],
  aMouseMoveSubscriptions: IClickSubsItem[],
  aMouseOverSubscriptions: IMouseOverSubsItem[],
  aRowHeight: number
) {
  context.set(aCtx);
  context2d.set(aCtx2d);
  tableRows.set(aTableRows);
  groupingColumnIds.set(aGroupedColumnIds);
  tableColumnIds.set(aTableColumnIds);
  propertyById.set(aPropertyById);
  scrollLeft.set(aScrollLeft);
  scrollTop.set(aScrollTop);
  viewportWidth.set(aViewportWidth);
  viewportHeight.set(aViewportHeight);
  isCheckBoxedTable.set(aIsCheckBoxedTable);
  gridLeadCellDimensions.set(aGridLeadCellDimensions);
  rowHeight.set(aRowHeight);
  columnWidths.set(aColumnWidths);
  fixedColumnCount.set(aFixedColumnCount);
  clickSubscriptions.set(aClickSubscriptions);
  mouseMoveSubscriptions.set(aMouseMoveSubscriptions);
  mouseOverSubscriptions.set(aMouseOverSubscriptions);
  try {
    clickSubscriptions().length = 0;
    mouseOverSubscriptions().length = 0;
    mouseMoveSubscriptions().length = 0;
    const ctx2d = context2d();
    ctx2d.fillStyle = "white";
    ctx2d.fillRect(0, 0, CPR()*viewportWidth(), CPR()*viewportHeight());
    const i0 = firstDrawableRowIndex();
    const i1 = lastDrawableRowIndex();
    if (i0 === undefined || i1 === undefined) return;
    for (let i = i0; i <= i1; i++) {
      renderRow(i);
    }
    setTableDebugRendered(context())
  } finally {
    for (let d of scRenderTable) d();
  }
}

function renderRowInternal() {
  if(rowIndex() === 0){
    clearTableDebugValues(context());
  }
  const fixColC = realFixedColumnCount();
  const firstDrCI = firstDrawableColumnIndex();
  const lastDrCI = lastDrawableColumnIndex();
  if (firstDrCI !== undefined && lastDrCI !== undefined) {
    const i0 = Math.max(fixColC, firstDrCI);
    const i1 = lastDrCI;
    for (let i = i1; i >= i0; i--) {
      renderCell(i);
    }
  }
  for (let i = 0; i < fixColC; i++) {
    renderCell(i);
  }
}

function renderSecondLayerCells() {
  setLayerIndex(1);
  currentRowCellsDimensions.clear();
  currentRowCellsDraws.clear()
  renderRowInternal();
  setLayerIndex(0);
}

export function renderRow(rowIdx: number) {
  rowIndex.set(rowIdx);
  setCurrentRowRightBorderDrawn(false);
  try {
    if (!currentRow()) return;
    renderRowInternal();
    if(cellLayerCount() === 2) {
      renderSecondLayerCells();
    }
  } finally {
    for (let d of scRenderRow) d();
  }
}

export function renderCell(columnIdx: number) {
  drawingColumnIndex.set(columnIdx);
  try {
    const ctx2d = context2d();
    ctx2d.save();
    drawCurrentCell();
    ctx2d.restore();
  } finally {
    for (let d of scRenderCell) d();
  }
}
