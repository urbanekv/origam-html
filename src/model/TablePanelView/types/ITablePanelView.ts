import { IProperty } from "../../types/IProperty";

export const CTablePanelView = "CTablePanelView";

export interface ITablePanelViewData {
  tablePropertyIds: string[];
}

export interface ITablePanelView extends ITablePanelViewData {
  $type: typeof CTablePanelView;
  selectedColumnId: string | undefined;
  selectedColumnIndex: number | undefined;
  selectedProperty: IProperty | undefined;
  selectedRowIndex: number | undefined;

  tableProperties: IProperty[];

  getCellValueByIdx(rowIdx: number, columnIdx: number): any;

  onCellClick(rowIndex: number, columnIndex: number): void;

  setSelectedColumnId(id: string | undefined): void;

  parent?: any;
}
