import {ICellOffset, IGroupTreeNode} from "gui/Components/ScreenElements/Table/TableRendering/types";
import { IProperty } from "./IProperty";

export interface IGrouper {
  getMaxRowCountSeen(rowId: string): number;
  getRowIndex(rowId: string): number | undefined;
  getAllValuesOfProp(property: IProperty): Promise<Set<any>>
  topLevelGroups: IGroupTreeNode[];
  allGroups: IGroupTreeNode[];
  getRowById(id: string): any[] | undefined;
  loadChildren(groupHeader: IGroupTreeNode): Generator;
  notifyGroupClosed(group: IGroupTreeNode): void;
  getCellOffset(rowId: string): ICellOffset;
  substituteRecord(row: any[]): void;
  parent?: any;
  start(): void;
}
