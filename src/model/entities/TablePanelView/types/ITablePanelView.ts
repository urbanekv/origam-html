import {IFilterConfiguration} from "../../types/IFilterConfiguration";
import {IProperty} from "../../types/IProperty";
import {IColumnConfigurationDialog} from "./IColumnConfigurationDialog";
import {IOrderingConfiguration} from "model/entities/types/IOrderingConfiguration";
import {IGroupingConfiguration} from "model/entities/types/IGroupingConfiguration";
import {AggregationContainer} from "../TablePanelView";
import {ICellRectangle} from "./ICellRectangle";

import {FilterGroupManager} from "model/entities/FilterGroupManager";
import {IConfigurationManager} from "model/entities/TablePanelView/types/IConfigurationManager";

export interface ITablePanelViewData {
  tablePropertyIds: string[];
  columnConfigurationDialog: IColumnConfigurationDialog;
  filterConfiguration: IFilterConfiguration;
  filterGroupManager: FilterGroupManager;
  orderingConfiguration: IOrderingConfiguration;
  groupingConfiguration: IGroupingConfiguration;
  rowHeight: number;
}

export interface ITableCanvas {
  firstVisibleRowIndex: number;
  lastVisibleRowIndex: number;
}

export interface ITablePanelView extends ITablePanelViewData {
  firstColumn: IProperty | undefined;
  $type_ITablePanelView: 1;
  selectedColumnId: string | undefined;
  selectedColumnIndex: number | undefined;
  selectedProperty: IProperty | undefined;
  selectedRowIndex: number | undefined;
  isEditing: boolean;
  fixedColumnCount: number;
  configurationManager: IConfigurationManager;

  tableCanvas: ITableCanvas | null;
  setTableCanvas(tableCanvas: ITableCanvas | null): void;
  firstVisibleRowIndex: number;
  lastVisibleRowIndex: number;

  tableProperties: IProperty[];
  allTableProperties: IProperty[];
  propertyMap: Map<string, IProperty>;

  hiddenPropertyIds: Map<string, boolean>;
  aggregations: AggregationContainer;

  getCellValueByIdx(rowIdx: number, columnIdx: number): any;
  getCellTextByIdx(rowIdx: number, columnIdx: number): any;

  onCellClick(event: any, row: any[], columnId: string, isControlInteraction: boolean): Generator;
  onNoCellClick(): Generator;
  onOutsideTableClick(): Generator;
  dontHandleNextScroll(): void;

  setEditing(state: boolean): void;
  selectNextColumn(nextRowWhenEnd?: boolean): void;
  selectPrevColumn(prevRowWhenStart?: boolean): void;

  setSelectedColumnId(id: string | undefined): void;
  swapColumns(id1: string, id2: string): void;
  moveColumnBehind(id1: string, id2: string): void

  columnOrderChangingTargetId: string | undefined;
  columnOrderChangingSourceId: string | undefined;
  setColumnOrderChangeAttendants(idSource: string | undefined, idTarget: string | undefined): void;

  subOnScrollToCellShortest(fn: (rowIdx: number, columnIdx: number) => void): () => void;
  subOnFocusTable(fn: () => void): () => void;

  scrollToCurrentCell(): void;
  scrollToCurrentRow(): void;
  triggerOnFocusTable(): void;
  triggerOnScrollToCellShortest(rowIdx: number, columnIdx: number): void;
  setPropertyHidden(propertyId: string, state: boolean): void;
  getCellRectangle(rowIndex: number, columnIndex: number): ICellRectangle;
  setCellRectangle(rowId: number, columnId: number, rectangle: ICellRectangle): void;
  clearCurrentCellEditData(): void;
  parent?: any;

  isLastColumnSelected(): boolean;
  isFirstColumnSelected(): boolean;
}
