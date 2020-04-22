
import { IGrouper } from "./types/IGrouper";
import { getDataTable } from "model/selectors/DataView/getDataTable";
import { getGroupingConfiguration } from "model/selectors/TablePanelView/getGroupingConfiguration";
import { IGroupRow } from "gui/Components/ScreenElements/Table/TableRendering/types";

export class ClientSideGrouper implements IGrouper {

  topLevelGroups: IGroupRow[] = []

  getTopLevelGroups(): IGroupRow[] {
    return this.topLevelGroups;
  }

  apply(firstGroupingColumn: string): void {
    const dataTable = getDataTable(this);
    this.topLevelGroups = this.makeGroups(dataTable.allRows, firstGroupingColumn)
  }


  makeGroups(rows: any[][], groupingColumn: string): IGroupRow[] {
    const level = this.findGroupLevel(groupingColumn)
    const index = this.findDataIndex(groupingColumn)
    return rows
      .map(row => row[index])
      .filter((v, i, a) => a.indexOf(v) === i) // distinct
      .map(groupName => {
        const groupRows = rows.filter(row => row[index] === groupName);
        return {
          isExpanded: false,
          groupLevel: level,
          columnLabel: groupingColumn,
          columnValue: groupName,
          sourceGroup: {
            childGroups: [],
            childRows: groupRows,
            columnLabel: groupingColumn,
            groupLabel: groupName,
            isExpanded: false,
            rowCount: groupRows.length
          },
          groupChildren: [],
          rowChildren: groupRows,
          parent: undefined
        };
      });
  }

  findGroupLevel(groupingColumn: string) {
    const groupingConfiguration = getGroupingConfiguration(this);
    const level = groupingConfiguration.groupingIndices.get(groupingColumn)
    if (!level) {
      throw new Error("Cannot find grouping index for column: " + groupingColumn)
    }
    return level;
  }

  findDataIndex(columnName: string) {
    const dataTable = getDataTable(this);
    const property = dataTable.getPropertyById(columnName)
    if (!property) {
      throw new Error("Cannot find property named: " + columnName)
    }
    return property.dataIndex
  }

  loadChildren(groupHeader: IGroupRow): void {
    const groupingConfiguration = getGroupingConfiguration(this);
    const nextColumnName = groupingConfiguration.nextColumnToGroupBy(groupHeader.columnValue);

    if (nextColumnName) {
      groupHeader.sourceGroup.childGroups = [];//this.makeGroups(groupHeader.rowChildren, nextColumnName)
    }
  }
}
