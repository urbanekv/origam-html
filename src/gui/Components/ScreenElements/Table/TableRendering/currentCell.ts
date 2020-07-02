import {
  currentDataRow,
  dataTable,
  drawingColumnIndex,
  gridLeadCellDimensions,
  propertyById,
  realFixedColumnCount,
  rowHeight,
  rowIndex,
  scRenderCell,
} from "./renderingValues";
import {currentRowCellsDimensions, currentRowCellsDraws} from "./currentRowCells";
import {Memoized} from "./common/Memoized";
import {dataRowColumnIds} from "./rowCells/dataRowCells";

export function drawCurrentCell() {
  const colIdx = drawingColumnIndex();
  const cellDraws = currentRowCellsDraws();
  if(colIdx >= cellDraws.length) return
  currentRowCellsDraws()[drawingColumnIndex()]();
}

export function currentColumnLeft() {
  return currentRowCellsDimensions()[drawingColumnIndex()].left;
}

export function currentColumnLeftVisible() {
  return currentRowCellsDimensions()[drawingColumnIndex()].leftVisible;
}

export function currentColumnWidthVisible() {
  return currentRowCellsDimensions()[drawingColumnIndex()].widthVisible;
}

export function currentColumnWidth() {
  return currentRowCellsDimensions()[drawingColumnIndex()].width;
}

export function currentColumnRight() {
  return currentRowCellsDimensions()[drawingColumnIndex()].right;
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
  return drawingColumnIndex() < realFixedColumnCount();
}

export function currentGridLeadCellLeft() {
  return gridLeadCellDimensions()[drawingColumnIndex()].left;
}

export function currentGridLeadCellWidth() {
  return gridLeadCellDimensions()[drawingColumnIndex()].width;
}

export function currentGridLeadCellRight() {
  return gridLeadCellDimensions()[drawingColumnIndex()].right;
}

export function currentColumnId() {
  return dataRowColumnIds()[drawingColumnIndex()];
}

export const currentProperty = () => propertyById().get(currentColumnId() as any)!;

export const currentCellText = Memoized(
  () => {
    const value = currentDataRow()[currentProperty().dataIndex];
    return dataTable().resolveCellText(currentProperty(), value)
  }
);
scRenderCell.push(() => currentCellText.clear());
