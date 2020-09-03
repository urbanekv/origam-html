import {
  columnWidths,
  context,
  context2d,
  currentDataRow,
  drawingColumnIndex,
  recordId,
  rowHeight,
  rowIndex,
  tableColumnIds,
  tablePanelView,
} from "../renderingValues";
import {
  currentCellText,
  currentColumnLeft,
  currentColumnLeftVisible,
  currentColumnWidth,
  currentColumnWidthVisible,
  currentProperty,
  currentRowHeight,
  currentRowTop,
  currentCellValue,
  isCurrentCellLoading,
} from "../currentCell";
import {
  applyScrollTranslation,
  cellPaddingLeft,
  cellPaddingLeftFirstCell, checkBoxCharacterFontSize,
  clipCell,
  fontSize,
  numberCellPaddingLeft,
  topTextOffset,
} from "./cellsCommon";
import { CPR } from "utils/canvas";
import { getSelectedRowId } from "model/selectors/TablePanelView/getSelectedRowId";
import { getRowStateColumnBgColor } from "model/selectors/RowState/getRowStateColumnBgColor";
import { getRowStateRowBgColor } from "model/selectors/RowState/getRowStateRowBgColor";
import { getRowStateAllowRead } from "model/selectors/RowState/getRowStateAllowRead";
import { getRowStateForegroundColor } from "model/selectors/RowState/getRowStateForegroundColor";
import selectors from "model/selectors-tree";
import moment from "moment";
import { onClick } from "../onClick";
import { getTablePanelView } from "model/selectors/TablePanelView/getTablePanelView";
import { onPossibleSelectedRowChange } from "model/actions-ui/onPossibleSelectedRowChange";
import { getMenuItemId } from "model/selectors/getMenuItemId";
import { getDataStructureEntityId } from "model/selectors/DataView/getDataStructureEntityId";
import { flow } from "mobx";
import actionsUi from "../../../../../../model/actions-ui-tree";
import { getDataView } from "../../../../../../model/selectors/DataView/getDataView";

export function dataColumnsWidths() {
  return tableColumnIds().map((id) => columnWidths().get(id) || 100);
}

export function dataColumnsDraws() {
  return tableColumnIds().map((id) => () => {
    applyScrollTranslation();
    clipCell();
    drawDataCellBackground();
    drawCellValue();
    registerClickHandler(id);
  });
}

function registerClickHandler(columnId: string) {
  const ctx = context();
  const row = currentDataRow();

  const thisCellRectangle = {
    columnLeft: currentColumnLeft(),
    columnWidth: currentColumnWidth(),
    rowTop: currentRowTop(),
    rowHeight: currentRowHeight(),
  };
  getTablePanelView(ctx).setCellRectangle(rowIndex(), drawingColumnIndex(), thisCellRectangle);

  const property = currentProperty();
  const clickableArea = getClickableArea(property.column);
  onClick({
    x: clickableArea.x,
    y: clickableArea.y,
    w: clickableArea.width,
    h: clickableArea.height,
    handler(event: any) {
      flow(function* () {
        if (event.isDouble) {
          const defaultAction = getDataView(ctx).defaultAction;
          if (defaultAction && defaultAction.isEnabled) {
            yield actionsUi.actions.onActionClick(ctx)(event, defaultAction);
          }
        } else {
          yield* getTablePanelView(ctx).onCellClick(event, row, columnId);
          yield onPossibleSelectedRowChange(ctx)(
            getMenuItemId(ctx),
            getDataStructureEntityId(ctx),
            getSelectedRowId(ctx)
          );
        }
      })();
    },
  });
}

function xCenter(){
  return CPR() * (currentColumnLeft() + currentColumnWidth() / 2);
}

function yCenter(){
  return CPR() * (currentRowTop() + rowHeight() / 2);
}

function getClickableArea(columnType: string){
  if(columnType === "CheckBox"){
    const fontSize = checkBoxCharacterFontSize * CPR();
    return {
      x: xCenter() - fontSize / 2,
      y: yCenter() - fontSize / 2,
      width: fontSize,
      height: fontSize,
    }
  }
  else{
    return {
      x: currentColumnLeftVisible(),
      y: currentRowTop(),
      width: currentColumnWidthVisible(),
      height: currentRowHeight(),
    }
  }
}


export function drawDataCellBackground() {
  const ctx2d = context2d();

  ctx2d.fillStyle = getUnderLineColor();
  ctx2d.fillRect(0, 0, currentColumnWidth() * CPR(), rowHeight() * CPR());

  ctx2d.fillStyle = getBackGroundColor();
  ctx2d.fillRect(
    CPR() * currentColumnLeft(),
    CPR() * currentRowTop(),
    CPR() * currentColumnWidth(),
    CPR() * currentRowHeight()
  );
}

function drawCellValue() {
  const ctx2d = context2d();
  const isHidden = !getRowStateAllowRead(tablePanelView(), recordId(), currentProperty().id);
  const foregroundColor = getRowStateForegroundColor(tablePanelView(), recordId(), "");
  const type = currentProperty().column;

  let isLink = false;
  let isLoading = false;
  const property = currentProperty();
  if (property.isLookup && property.lookupEngine) {
    isLoading = isCurrentCellLoading();
    isLink = selectors.column.isLinkToForm(currentProperty());
  }

  ctx2d.font = `${fontSize * CPR()}px "IBM Plex Sans", sans-serif`;
  if (isHidden) {
    return;
  }
  if (isLoading) {
    ctx2d.fillStyle = "#888888";
    ctx2d.fillText(
      "Loading...",
      CPR() * (currentColumnLeft() + getPaddingLeft()),
      CPR() * (currentRowTop() + topTextOffset)
    );
  } else {
    ctx2d.fillStyle = foregroundColor || "black";
    switch (type) {
      case "CheckBox":
        ctx2d.font = `${checkBoxCharacterFontSize * CPR()}px "Font Awesome 5 Free"`;
        ctx2d.textAlign = "center";
        ctx2d.textBaseline = "middle";

        ctx2d.fillText(
          !!currentCellText() ? "\uf14a" : "\uf0c8",
          xCenter(),
          yCenter()
        );
        break;
      case "Date":
        if (currentCellText() !== null && currentCellText() !== "") {
          let momentValue = moment(currentCellText());
          if (!momentValue.isValid()) {
            break;
          }
          ctx2d.fillText(
            momentValue.format(currentProperty().formatterPattern),
            CPR() * (currentColumnLeft() + getPaddingLeft()),
            CPR() * (currentRowTop() + topTextOffset)
          );
        }
        break;
      case "ComboBox":
      case "TagInput":
      case "Checklist":
        if (isLink) {
          ctx2d.save();
          ctx2d.fillStyle = "#4c84ff";
        }
        if (currentCellText() !== null) {
          ctx2d.fillText(
            "" + currentCellText()!,
            CPR() * (currentColumnLeft() + getPaddingLeft()),
            CPR() * (currentRowTop() + topTextOffset)
          );
        }
        if (isLink) {
          ctx2d.restore();
        }
        break;
      case "Number":
        if (currentCellText() !== null) {
          ctx2d.save();
          ctx2d.textAlign = "right";
          ctx2d.fillText(
            "" + currentCellText()!,
            CPR() * (currentColumnLeft() + currentColumnWidth() - numberCellPaddingLeft()),
            CPR() * (currentRowTop() + topTextOffset)
          );
          ctx2d.restore();
        }
        break;
      default:
        if (currentCellText() !== null) {
          if (!currentProperty().isPassword) {
            ctx2d.fillText(
              "" + currentCellText()!,
              CPR() * (currentColumnLeft() + getPaddingLeft()),
              CPR() * (currentRowTop() + topTextOffset)
            );
          } else {
            ctx2d.fillText("*******", numberCellPaddingLeft() * CPR(), 15 * CPR());
          }
        }
    }
  }
}

function getPaddingLeft() {
  return drawingColumnIndex() === 0 ? cellPaddingLeftFirstCell : cellPaddingLeft;
}

function getUnderLineColor() {
  return "#e5e5e5";
}

function getBackGroundColor() {
  const isColumnOrderChangeSource =
    tablePanelView().columnOrderChangingSourceId === currentProperty().id;
  const selectedColumnId = tableColumnIds()[drawingColumnIndex()];
  const selectedRowId = getSelectedRowId(tablePanelView());

  const isCellCursor = currentProperty().id === selectedColumnId && recordId() === selectedRowId;
  const isRowCursor = recordId() === selectedRowId;

  const backgroundColor =
    getRowStateColumnBgColor(tablePanelView(), recordId(), "") ||
    getRowStateRowBgColor(tablePanelView(), recordId());

  if (isColumnOrderChangeSource) {
    return "#eeeeff";
    //} else if(cell.isColumnOrderChangeTarget){
  } else if (isCellCursor) {
    return "#eaf0f9";
  } else if (isRowCursor) {
    return "#ebf3ff";
  } else {
    if (backgroundColor) {
      return backgroundColor;
    } else {
      return rowIndex() % 2 === 1 ? "#f7f6fa" : "#ffffff";
    }
  }
}
