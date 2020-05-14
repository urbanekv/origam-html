import { IProperty } from "./IProperty";
import { IAdditionalRowData } from "./IAdditionalRecordData";
import { IDataSourceField } from "./IDataSourceField";
import { IGroupTreeNode } from "gui/Components/ScreenElements/Table/TableRendering/types";
import {observable} from "mobx";

export interface IDataTableData {}

export interface IDataTable extends IDataTableData {
  $type_IDataTable: 1;
  properties: IProperty[];
  rows: any[][];
  allRows: any[][];
  additionalRowData: Map<string, IAdditionalRowData>;
  visibleRowCount: number;
  groups: IGroupTreeNode[];
  sortingFn:
    | ((dataTable: IDataTable) => (row1: any[], row2: any[]) => number)
    | undefined;

  getRowId(row: any[]): string;
  getCellValue(row: any[], property: IProperty): any;
  getCellValueByDataSourceField(row: any[], dsField: IDataSourceField): any;
  getCellText(row: any[], property: IProperty): any;
  resolveCellText(property: IProperty, value: any): any
  getRowByExistingIdx(idx: number): any[];
  getRowById(id: string): any[] | undefined 
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
  getAllValuesOfProp(property: IProperty): any[];

  setSortingFn(fn: ((dataTable: IDataTable) => (row1: any[], row2: any[]) => number)
  | undefined): void;
  /*setFilteringFn(fn: ((dataTable: IDataTable) => (row: any[]) => boolean)
  | undefined): void;*/

  
  setRecords(rows: any[][]): void;
  setFormDirtyValue(row: any[], propertyId: string, value: any): void;
  setDirtyValue(row: any[], columnId: string, value: any): void;
  flushFormToTable(row: any[]): void;
  setDirtyDeleted(row: any[]): void;
  setDirtyNew(row: any[]): void;
  deleteAdditionalRowData(row: any[]): void;
  deleteRow(row: any[]): void;
  clear(): void;
  clearRecordDirtyValues(id: string): void;
  substituteRecord(row: any[]): void;
  insertRecord(index: number, row: any[]): void;
  parent?: any;
}

export const isIDataTable = (o: any): o is IDataTable => o.$type.IDataTable;
