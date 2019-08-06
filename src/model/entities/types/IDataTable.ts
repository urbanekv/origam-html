import { IProperty } from "./IProperty";
import { IAdditionalRowData } from "./IAdditionalRecordData";

export interface IDataTableData {}

export interface IDataTable extends IDataTableData {
  $type_IDataTable: 1;
  properties: IProperty[];
  rows: any[][];
  additionalRowData: Map<string, IAdditionalRowData>;

  getRowId(row: any[]): string;
  getCellValue(row: any[], property: IProperty): any;
  getCellText(row: any[], property: IProperty): any;
  resolveCellText(property: IProperty, value: any): any
  getRowByExistingIdx(idx: number): any[];
  getExistingRowIdxById(id: string): number | undefined;
  getPropertyById(id: string): IProperty | undefined;
  getFirstRow(): any[] | undefined;
  getNearestRow(row: any[]): any[] | undefined;
  getNextExistingRowId(id: string): string | undefined;
  getPrevExistingRowId(id: string): string | undefined;

  getDirtyValues(row: any[]): Map<string, any>;
  getDirtyValueRows(): any[][];
  getDirtyDeletedRows(): any[][];
  getDirtyNewRows(): any[][];

  setRecords(rows: any[][]): void;
  setFormDirtyValue(row: any[], propertyId: string, value: any): void;
  flushFormToTable(row: any[]): void;
  setDirtyDeleted(row: any[]): void;
  setDirtyNew(row: any[]): void;
  deleteAdditionalRowData(row: any[]): void;
  deleteRow(row: any[]): void;
  clear(): void;
  clearRecordDirtyValues(id: string): void;
  substituteRecord(row: any[]): void;
  insertRecord(index: number, row: any[]): void;
  getRowFromDataSourceRow(rowIn: any[]): any[];
  parent?: any;
}

export const isIDataTable = (o: any): o is IDataTable => o.$type.IDataTable;