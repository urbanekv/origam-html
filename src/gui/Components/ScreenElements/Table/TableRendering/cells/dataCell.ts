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

import { flow } from "mobx";
import { getRowStateAllowRead } from "model/selectors/RowState/getRowStateAllowRead";
import { getRowStateForegroundColor } from "model/selectors/RowState/getRowStateForegroundColor";
import { getRowStateRowBgColor } from "model/selectors/RowState/getRowStateRowBgColor";
import { getSelectedRowId } from "model/selectors/TablePanelView/getSelectedRowId";
import { getTablePanelView } from "model/selectors/TablePanelView/getTablePanelView";
import { CPR } from "utils/canvas";
import { shadeHexColor } from "utils/colorUtils";
import actionsUi from "model/actions-ui-tree";
import { getDataView } from "model/selectors/DataView/getDataView";
import { getShowToolTipsForMemoFieldsOnly } from "model/selectors/Workbench/getShowToolTipsForMemoFieldsOnly";
import {
  currentCellErrorMessage,
  currentColumnLeft,
  currentColumnLeftVisible,
  currentColumnWidth,
  currentColumnWidthVisible,
  currentProperty,
  currentRowHeight,
  currentRowTop,
  isCurrentCellLoading,
} from "../currentCell";
import { onClick, onMouseMove } from "../onClick";
import {
  columnWidths,
  context,
  context2d,
  currentDataRow,
  drawingColumnIndex,
  recordId,
  rowIndex,
  tableColumnIds,
  tablePanelView,
} from "../renderingValues";
import {
  applyScrollTranslation,
  checkBoxCharacterFontSize,
  clipCell,
  drawSelectedRowBorder,
  fontSize,
  frontStripWidth,
  selectRowBorderWidth,
  topTextOffset,
} from "./cellsCommon";
import {
  currentDataCellRenderer,
  getPaddingLeft,
  xCenter,
  getPaddingRight,
} from "gui/Components/ScreenElements/Table/TableRendering/cells/dataCellRenderer";

export function dataColumnsWidths() {
  return tableColumnIds().map((id) => columnWidths().get(id) || 100);
}

export function dataColumnsDraws() {
  return tableColumnIds().map((id) => () => {
    applyScrollTranslation();
    drawDataCellBackground();
    drawInvalidDataSymbol();
    clipCell();
    drawCellValue();
    registerClickHandler(id);
    registerToolTipGetter(id);
  });
}

function registerToolTipGetter(columnId: string) {
  const ctx2d = context2d();
  const property = currentProperty();
  const cellRenderer = currentDataCellRenderer(ctx2d);
  const cellClickableArea = getCellClickableArea();
  const cellWidth = currentColumnWidth();

  if (property.column === "CheckBox" || property.column === "Image" || property.column === "Blob") {
    return;
  }

  if (
    getShowToolTipsForMemoFieldsOnly(property) &&
    (property.column !== "Text" || !property.multiline)
  ) {
    return;
  }

  const cellTextRendered = cellRenderer.cellText;
  const textWidth = ctx2d.measureText(cellTextRendered).width / CPR();

  const hasTooltip = cellWidth - getPaddingLeft() - getPaddingRight() < textWidth;
  const tablePanelView = getTablePanelView(context());

  onMouseMove({
    x: cellClickableArea.x,
    y: cellClickableArea.y,
    w: cellClickableArea.width,
    h: cellClickableArea.height,
    handler(event: any) {
      if (hasTooltip) {
        tablePanelView.currentTooltipText = cellTextRendered;
      } else {
        tablePanelView.currentTooltipText = undefined;
      }
    },
  });
}

function registerClickHandler(columnId: string) {
  const ctx = context();
  const row = currentDataRow();

  const property = currentProperty();

  const cellClickableArea = getCellClickableArea();
  if (property.column === "CheckBox") {
    const checkboxClickableArea = getCheckboxClickableArea();
    onClick({
      x: checkboxClickableArea.x,
      y: checkboxClickableArea.y,
      w: checkboxClickableArea.width,
      h: checkboxClickableArea.height,
      handler(event: any) {
        flow(function* () {
          if (event.isDouble) {
            getTablePanelView(ctx).setEditing(false);
            const defaultAction = getDataView(ctx).firstEnabledDefaultAction;
            if (defaultAction) {
              yield actionsUi.actions.onActionClick(ctx)(event, defaultAction);
            }
          } else {
            yield* getTablePanelView(ctx).onCellClick(event, row, columnId, true);
          }
        })();
      },
    });
    onClick({
      x: cellClickableArea.x,
      y: cellClickableArea.y,
      w: cellClickableArea.width,
      h: cellClickableArea.height,
      handler(event: any) {
        flow(function* () {
          if (event.isDouble) {
            getTablePanelView(ctx).setEditing(false);
            const defaultAction = getDataView(ctx).firstEnabledDefaultAction;
            if (defaultAction && defaultAction.isEnabled) {
              yield actionsUi.actions.onActionClick(ctx)(event, defaultAction);
            }
          } else {
            yield* getTablePanelView(ctx).onCellClick(event, row, columnId, false);
          }
        })();
      },
    });
  } else {
    onClick({
      x: cellClickableArea.x,
      y: cellClickableArea.y,
      w: cellClickableArea.width,
      h: cellClickableArea.height,
      handler(event: any) {
        flow(function* () {
          if (event.isDouble) {
            getTablePanelView(ctx).setEditing(false);
            const defaultAction = getDataView(ctx).firstEnabledDefaultAction;
            if (defaultAction && defaultAction.isEnabled) {
              yield actionsUi.actions.onActionClick(ctx)(event, defaultAction);
            }
          } else {
            yield* getTablePanelView(ctx).onCellClick(event, row, columnId, false);
          }
        })();
      },
    });
  }
}

function getCellClickableArea() {
  return {
    x: currentColumnLeftVisible(),
    y: currentRowTop(),
    width: currentColumnWidthVisible(),
    height: currentRowHeight(),
  };
}

function getCheckboxClickableArea() {
  const fontSize = checkBoxCharacterFontSize;
  return {
    x: xCenter() - fontSize / 2,
    y: currentRowTop() + topTextOffset - 4 - fontSize / 2,
    width: fontSize,
    height: fontSize,
  };
}

export function drawDataCellBackground() {
  const ctx2d = context2d();
  const ctx = context();
  const selectedRowId = getSelectedRowId(tablePanelView());
  const isRowCursor = recordId() === selectedRowId;

  const thisCellRectangle = {
    columnLeft: currentColumnLeft(),
    columnWidth: currentColumnWidth(),
    rowTop: currentRowTop(),
    rowHeight: currentRowHeight(),
  };
  getTablePanelView(ctx).setCellRectangle(rowIndex(), drawingColumnIndex(), thisCellRectangle);
  if (drawingColumnIndex() === 0) {
    getTablePanelView(ctx).firstColumn = currentProperty();
  }

  ctx2d.fillStyle = getBackGroundColor();
  ctx2d.fillRect(
    CPR() * currentColumnLeft(),
    CPR() * currentRowTop(),
    CPR() * currentColumnWidth(),
    CPR() * (currentRowHeight() - 1)
  );
  if (isRowCursor) {
    drawSelectedRowBorder(frontStripWidth);
  }
}

function drawInvalidDataSymbol() {
  const ctx2d = context2d();
  let isInvalid = !!currentCellErrorMessage();
  const property = currentProperty();
  const selectedRowId = getSelectedRowId(tablePanelView());
  const isRowCursor = recordId() === selectedRowId;

  let isLoading = false;
  if (property.isLookup && property.lookupEngine) {
    isLoading = isCurrentCellLoading();
  }

  if (isInvalid && !isLoading) {
    const leftOffset = drawingColumnIndex() === 0 && isRowCursor ? frontStripWidth / 2 : 0;
    const topBottomOffset = isRowCursor ? selectRowBorderWidth : 0;
    ctx2d.save();
    ctx2d.fillStyle = "red";
    ctx2d.beginPath();
    ctx2d.moveTo(
      leftOffset + currentColumnLeft() * CPR(),
      topBottomOffset + currentRowTop() * CPR()
    );
    ctx2d.lineTo(
      (leftOffset + currentColumnLeft() + 5) * CPR(),
      (currentRowTop() + 0.5 * currentRowHeight()) * CPR()
    );
    ctx2d.lineTo(
      leftOffset + currentColumnLeft() * CPR(),
      (currentRowTop() + currentRowHeight() - topBottomOffset) * CPR()
    );
    ctx2d.fill();
    ctx2d.restore();
  }
}

function drawCellValue() {
  const ctx2d = context2d();
  const property = currentProperty();
  const isHidden = !getRowStateAllowRead(tablePanelView(), recordId(), property.id);
  const foregroundColor = getRowStateForegroundColor(tablePanelView(), recordId());
  let isLoading = false;
  if (property.isLookup && property.lookupEngine) {
    isLoading = isCurrentCellLoading();
  }

  ctx2d.font = `${fontSize * CPR()}px "IBM Plex Sans", sans-serif`;
  if (isHidden) {
    return;
  }
  if (isLoading) {
    ctx2d.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--grey4');
    ctx2d.fillText(
      "Loading...",
      CPR() * (currentColumnLeft() + getPaddingLeft()),
      CPR() * (currentRowTop() + topTextOffset)
    );
  } else {
    ctx2d.fillStyle = foregroundColor || "black";
    currentDataCellRenderer(ctx2d).drawCellText();
  }
}

function getBackGroundColor() {
  const isColumnOrderChangeSource =
    tablePanelView().columnOrderChangingSourceId === currentProperty().id;
  const selectedRowId = getSelectedRowId(tablePanelView());

  const isRowCursor = recordId() === selectedRowId;

  const backgroundColor = getRowStateRowBgColor(tablePanelView(), recordId());

  if (isColumnOrderChangeSource) {
    return  getComputedStyle(document.documentElement).getPropertyValue('--grey2');
  } else if (isRowCursor) {
    return backgroundColor
      ? shadeHexColor(backgroundColor, -0.1)!
      : getComputedStyle(document.documentElement).getPropertyValue('--blue5');
  } else {
    if (backgroundColor) {
      return backgroundColor;
    } else {
      return rowIndex() % 2 === 1
        ? getComputedStyle(document.documentElement).getPropertyValue('--grey1')
        : getComputedStyle(document.documentElement).getPropertyValue('--white');
    }
  }
}
