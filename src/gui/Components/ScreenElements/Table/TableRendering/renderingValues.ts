import {ValueBox} from "./common/ValueBox";
import {IClickSubsItem, ITableRow} from "./types";
import {Memoized} from "./common/Memoized";
import {getTablePanelView} from "model/selectors/TablePanelView/getTablePanelView";
import {getDataTable} from "model/selectors/DataView/getDataTable";
import {IProperty} from "model/entities/types/IProperty";
import {getIsSelectionCheckboxesShown} from "model/selectors/DataView/getIsSelectionCheckboxesShown";
import {getDataView} from "model/selectors/DataView/getDataView";


export const scRenderTable: Array<() => void> = [];
export const scRenderRow: Array<() => void> = [];
export const scRenderCell: Array<() => void> = [];

export const context = ValueBox<any>();
scRenderTable.push(() => context.clear());

export const context2d = ValueBox<CanvasRenderingContext2D>();
scRenderTable.push(() => context2d.clear());

export const rowIndex = ValueBox<number>();
scRenderRow.push(() => rowIndex.clear());

export const rowId = () => dataTable().getRowId(currentDataRow());

export const selectionColumnShown = () =>  getIsSelectionCheckboxesShown(context());

export const drawingColumnIndex = ValueBox<number>();
scRenderCell.push(() => drawingColumnIndex.clear());

export const tableRows = ValueBox<ITableRow[]>();
scRenderTable.push(() => tableRows.clear());

export const viewportWidth = ValueBox<number>();
scRenderTable.push(() => viewportWidth.clear());

export const viewportHeight = ValueBox<number>();
scRenderTable.push(() => viewportHeight.clear());

export const scrollLeft = ValueBox<number>();
scRenderTable.push(() => scrollLeft.clear());

export const scrollTop = ValueBox<number>();
scRenderTable.push(() => scrollTop.clear());

export const viewportLeft = scrollLeft;

export const viewportTop = scrollTop;

export const viewportRight = () => viewportLeft() + viewportWidth();

export const viewportBottom = () => viewportTop() + viewportHeight();

export const worldWidth = Memoized(() => gridLeadCellDimensions().slice(-1)[0].right)
scRenderTable.push(() => worldWidth.clear());

export const worldHeight = Memoized(() => tableRowsCount() * rowHeight())
scRenderTable.push(() => worldHeight.clear());

export const rowHeight = ValueBox<number>();
scRenderTable.push(() => rowHeight.clear());

export const tableColumnIds = ValueBox<string[]>();
scRenderTable.push(() => tableColumnIds.clear());

export const groupingColumnIds = ValueBox<string[]>();
scRenderTable.push(() => groupingColumnIds.clear());

export const groupingColumnCount = () => groupingColumnIds().length;

export const isGrouping = () => groupingColumnIds().length > 0;

export function currentRow(): ITableRow {
  return tableRows()[rowIndex()];
}

export function currentDataRow(): any[] {
  return currentRow() as any[];
}

export const isCheckBoxedTable = ValueBox<boolean>();
scRenderTable.push(isCheckBoxedTable.clear);

export const fixedColumnCount = ValueBox<number>();
scRenderTable.push(fixedColumnCount.clear);

export const columnWidths = ValueBox<Map<string, number>>();
scRenderTable.push(columnWidths.clear);

export const realFixedColumnCount = () =>
  isCheckBoxedTable() ? fixedColumnCount() + 1 : fixedColumnCount();

export const gridLeadCellDimensions = ValueBox<{ left: number; width: number; right: number }[]>();
scRenderTable.push(gridLeadCellDimensions.clear);

export const propertyById = ValueBox<Map<string, IProperty>>();
scRenderTable.push(propertyById.clear)

export const tableRowsCount = () => tableRows().length

export const clickSubscriptions = ValueBox<IClickSubsItem[]>();
scRenderTable.push(clickSubscriptions.clear)

export const tablePanelView = () => getTablePanelView(context());
// export const property = () => getTableViewPropertyById(tablePanelView(),  dataRowColumnIds()[drawingColumnIndex()]!);// currentColumnId()!);
//export const property = () => getTableViewPropertyByIdx(tablePanelView(), drawingColumnIndex() - realFixedColumnCount());// currentColumnId()!);
 
export const dataTable = () => getDataTable(tablePanelView());
export const dataView = () => getDataView(context());
export const recordId = () =>  dataTable().getRowId(currentDataRow()); 