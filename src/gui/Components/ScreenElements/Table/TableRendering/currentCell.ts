import {
  columnIndex,
  rowIndex,
  tableRows,
  rowHeight,
  realFixedColumnCount,
  gridLeadCellDimensions,
  propertyById,
  scRenderCell,
} from "./renderingValues";
import { currentRowCellsDraws, currentRowCellsDimensions } from "./currentRowCells";
import { ITableRow } from "./types";
import { Memoized } from "./common/Memoized";
import { dataRowColumnIds } from "./rowCells/dataRowCells";

export function drawCurrentCell() {
  const colIdx = columnIndex();
  const cellDraws = currentRowCellsDraws();
  if(colIdx >= cellDraws.length) return
  currentRowCellsDraws()[columnIndex()]();
}

export function currentRow(): ITableRow {
  return tableRows()[rowIndex()];
}

export function currentDataRow(): any[] {
  return currentRow() as any[];
}

export function currentColumnLeft() {
  return currentRowCellsDimensions()[columnIndex()].left;
}

export function currentColumnWidth() {
  return currentRowCellsDimensions()[columnIndex()].width;
}

export function currentColumnRight() {
  return currentRowCellsDimensions()[columnIndex()].right;
}

export function currentRowTop() {
  return rowIndex() * rowHeight();
}

export function currentRowHeight() {
  return rowHeight();
}

export function currentRowBottom() {
  return currentRowTop() + currentRowHeight();
}

export function isCurrentCellFixed() {
  return columnIndex() < realFixedColumnCount();
}

export function currentGridLeadCellLeft() {
  return gridLeadCellDimensions()[columnIndex()].left;
}

export function currentGridLeadCellWidth() {
  return gridLeadCellDimensions()[columnIndex()].width;
}

export function currentGridLeadCellRight() {
  return gridLeadCellDimensions()[columnIndex()].right;
}

export function currentColumnId() {
  return dataRowColumnIds()[columnIndex()];
}

export const currentCellText = Memoized(
  () => {
    return currentDataRow()[propertyById().get(currentColumnId() as any)!.dataIndex]
  }
);
scRenderCell.push(() => currentCellText.clear());
