import { ICells, ICell, IHeader } from "./types";
import { IOrderByDirection } from "../../../../DataView/Ordering/types";
import { ML } from "../../../../utils/types";
import { IPropReorder } from "../../../../DataView/types/IPropReorder";
import { unpack } from "../../../../utils/objects";
import { computed } from "mobx";
import { IDataTable } from "../../../../DataView/types/IDataTable";
import { IRecCursor } from "../../../../DataView/types/IRecCursor";
import { IPropCursor } from "../../../../DataView/types/IPropCursor";
import { makeCellVisibleById } from "../../../../DataView/TableView/TableViewActions";
import { IApi } from "../../../../Api/IApi";

export class TableViewCells implements ICells {
  constructor(
    public P: {
      propReorder: ML<IPropReorder>;
      dataTable: ML<IDataTable>;
      recCursor: ML<IRecCursor>;
      propCursor: ML<IPropCursor>;
    }
  ) {}

  @computed get rowCount(): number {
    return this.dataTable.existingRecordCount;
  }

  @computed get columnCount(): number {
    return this.propReorder.count;
  }

  fixedColumnCount: number = 0;

  // TODO: Use method from Selection class
  @computed get selPropIdx() {
    const idx = this.propCursor.selId
      ? this.propReorder.getIndexById(this.propCursor.selId)
      : undefined;
    console.log("computed selPropIdx:", idx);
    return idx;
  }

  // TODO: Use method from Selection class
  @computed get selRecIdx() {
    const idx = this.recCursor.selId
      ? this.dataTable.getRecordIndexById(this.recCursor.selId)
      : undefined;
    console.log("computed selRecIdx,Id:", idx, this.recCursor.selId);
    return idx;
  }

  @computed
  get contentWidth(): number {
    return this.getColumnRight(this.columnCount - 1) - this.getColumnLeft(0);
  }

  @computed get contentHeight(): number {
    return this.getRowBottom(this.rowCount - 1) - this.getRowTop(0);
  }

  getRowTop(rowIdx: number): number {
    return rowIdx * this.getRowHeight(rowIdx);
  }

  getRowHeight(rowIdx: number): number {
    return 20;
  }

  getRowBottom(rowIdx: number): number {
    return this.getRowTop(rowIdx) + this.getRowHeight(rowIdx);
  }

  getColumnLeft(columnIdx: number): number {
    return columnIdx * this.getColumnWidth(columnIdx);
  }

  getColumnWidth(columnIdx: number): number {
    return 100;
  }

  getColumnRight(columnIdx: number): number {
    return this.getColumnLeft(columnIdx) + this.getColumnWidth(columnIdx);
  }

  getCell(rowIdx: number, columnIdx: number): ICell {
    const record = this.dataTable.getRecordByIdx(rowIdx);
    const property = this.propReorder.getByIndex(columnIdx);
    let value;
    let isLoading = false;
    let isError = false;
    if (record && property) {
      value = this.dataTable.getValue(record, property);
      if (property.lookupResolver) {
        isError = property.lookupResolver.isError(value);
        isLoading = property.lookupResolver.isLoading(value);
        value = property.lookupResolver.getValue(value);
      }
      switch (property.column) {
        case "CheckBox":
          return {
            type: "BoolCell",
            value: value !== undefined && value !== null ? value : "",
            onChange(event: any, value: boolean) {},
            isLoading,
            isInvalid: false,
            isReadOnly: property.isReadOnly,
            isRowCursor: this.selRecIdx === rowIdx,
            isCellCursor:
              this.selRecIdx === rowIdx && this.selPropIdx === columnIdx
          };
        case "Text":
          return {
            type: "TextCell",
            value: value !== undefined && value !== null ? value : "",
            onChange(event: any, value: string) {},
            isLoading,
            isInvalid: false,
            isReadOnly: property.isReadOnly,
            isRowCursor: this.selRecIdx === rowIdx,
            isCellCursor:
              this.selRecIdx === rowIdx && this.selPropIdx === columnIdx
          };
        case "ComboBox":
          return {
            type: "DropdownCell",
            value: value !== undefined && value !== null ? value : "",
            textualValue: "",
            isLoading,
            isInvalid: false,
            isReadOnly: property.isReadOnly,
            isRowCursor: this.selRecIdx === rowIdx,
            isCellCursor:
              this.selRecIdx === rowIdx && this.selPropIdx === columnIdx,

            ColumnNames: [],
            DataStructureEntityId: "",
            LookupId: "",
            Property: "",
            RowId: "",
            menuItemId: "",
            api: null as unknown as any,
            onTextChange(event: any, value: string) {},
            onItemSelect(event: any, value: string) {}
          };
      }
    }
    return {
      type: "TextCell",
      value: value !== undefined && value !== null ? value : "",
      onChange(event: any, value: string) {},
      isLoading,
      isInvalid: false,
      isReadOnly: true,
      isRowCursor: this.selRecIdx === rowIdx,
      isCellCursor: this.selRecIdx === rowIdx && this.selPropIdx === columnIdx
    };
  }

  getHeader(columnIdx: number): IHeader {
    return {
      label: this.propReorder.getByIndex(columnIdx)!.name,
      orderBy: {
        direction: IOrderByDirection.NONE,
        order: 0
      }
    };
  }

  get propReorder() {
    return unpack(this.P.propReorder);
  }

  get dataTable() {
    return unpack(this.P.dataTable);
  }

  get recCursor() {
    return unpack(this.P.recCursor);
  }

  get propCursor() {
    return unpack(this.P.propCursor);
  }

}
