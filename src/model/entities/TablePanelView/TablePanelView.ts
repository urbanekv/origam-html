import { observable, computed, action, autorun } from "mobx";
import {
  ITablePanelView,
  ITablePanelViewData,
  ITableCanvas
} from "./types/ITablePanelView";
import { getDataView } from "../../selectors/DataView/getDataView";
import { getDataTable } from "../../selectors/DataView/getDataTable";
import { IProperty } from "../types/IProperty";
import { getDataViewPropertyById } from "../../selectors/DataView/getDataViewPropertyById";
import { getSelectedRow } from "../../selectors/DataView/getSelectedRow";
import { getDataViewLifecycle } from "../../selectors/DataView/getDataViewLifecycle";
import { IColumnConfigurationDialog } from "./types/IColumnConfigurationDialog";
import { IFilterConfiguration } from "../types/IFilterConfiguration";

export class TablePanelView implements ITablePanelView {
  
  $type_ITablePanelView: 1 = 1;

  constructor(data: ITablePanelViewData) {
    Object.assign(this, data);
    this.columnConfigurationDialog.parent = this;
    this.filterConfiguration.parent = this;
  }

  columnConfigurationDialog: IColumnConfigurationDialog = null as any;
  filterConfiguration: IFilterConfiguration = null as any;

  @observable isEditing: boolean = false;
  @observable fixedColumnCount: number = 0;
  @observable tablePropertyIds: string[] = [];

  @observable hiddenPropertyIds: Map<string, boolean> = new Map();
  @observable groupingIndices: Map<string, number> = new Map();

  @observable columnOrderChangingTargetId: string | undefined;
  @observable columnOrderChangingSourceId: string | undefined;

  @computed get allTableProperties() {
    return this.tablePropertyIds.map(id =>
      getDataTable(this).getPropertyById(id)
    ) as IProperty[];
  }

  @computed get tableProperties() {
    return this.allTableProperties.filter(
      prop => !this.hiddenPropertyIds.get(prop.id)
    );
  }
  @observable selectedColumnId: string | undefined;
  @computed get selectedRowId(): string | undefined {
    return getDataView(this).selectedRowId;
  }

  @computed get selectedColumnIndex(): number | undefined {
    const idx = this.tableProperties.findIndex(
      prop => prop.id === this.selectedColumnId
    );
    return idx > -1 ? idx : undefined;
  }

  @computed get selectedRowIndex(): number | undefined {
    return getDataView(this).selectedRowIndex;
  }

  @computed get selectedProperty(): IProperty | undefined {
    return this.selectedColumnId
      ? getDataViewPropertyById(this, this.selectedColumnId)
      : undefined;
  }

  @observable.ref tableCanvas: ITableCanvas | null = null;

  @action.bound
  setTableCanvas(tableCanvas: ITableCanvas | null): void {
    this.tableCanvas = tableCanvas;
  }

  get firstVisibleRowIndex(): number {
    return this.tableCanvas ? this.tableCanvas.firstVisibleRowIndex : 0;
  }

  get lastVisibleRowIndex(): number {
    return this.tableCanvas ? this.tableCanvas.lastVisibleRowIndex : 0;
  }

  getCellValueByIdx(rowIdx: number, columnIdx: number) {
    const property = this.tableProperties[columnIdx]!;
    const row = this.dataTable.getRowByExistingIdx(rowIdx);
    return this.dataTable.getCellValue(row, property);
  }

  getCellTextByIdx(rowIdx: number, columnIdx: number) {
    const property = this.tableProperties[columnIdx]!;
    const row = this.dataTable.getRowByExistingIdx(rowIdx);
    return this.dataTable.getCellText(row, property);
  }

  @action.bound
  onCellClick(rowIndex: number, columnIndex: number): void {
    // console.log("CellClicked:", rowIndex, columnIndex);
    const row = this.dataTable.getRowByExistingIdx(rowIndex);
    const property = this.tableProperties[columnIndex];
    if (
      this.dataTable.getRowId(row) === this.selectedRowId &&
      property.id === this.selectedColumnId
    ) {
      this.setEditing(true);
    } else {
      const { isEditing } = this;
      if (isEditing) {
        this.editingWillFinish();
        this.setEditing(false);
      }
      this.selectCell(this.dataTable.getRowId(row) as string, property.id);
      if (isEditing) {
        this.setEditing(true);
      }
    }
  }

  @action.bound
  onNoCellClick(): void {
    if (this.isEditing) {
      this.editingWillFinish();
      this.setEditing(false);
    }
  }

  @action.bound
  onOutsideTableClick(): void {
    if (this.isEditing) {
      this.editingWillFinish();
      this.setEditing(false);
    }
  }

  @action.bound editingWillFinish() {
    this.dataTable.flushFormToTable(getSelectedRow(this)!);
    getDataViewLifecycle(this).requestFlushData(
      getSelectedRow(this)!,
      this.selectedProperty!
    );
  }

  @action.bound selectCell(
    rowId: string | undefined,
    columnId: string | undefined
  ) {
    this.selectedColumnId = columnId;
    getDataView(this).selectRowById(rowId);
  }

  @action.bound
  setSelectedColumnId(id: string | undefined): void {
    this.selectedColumnId = id;
  }

  @action.bound
  setEditing(state: boolean): void {
    this.isEditing = state;
  }

  @action.bound
  swapColumns(id1: string, id2: string): void {
    const idx1 = this.tablePropertyIds.findIndex(id => id === id1);
    const idx2 = this.tablePropertyIds.findIndex(id => id === id2);
    const tmp = this.tablePropertyIds[idx1];
    this.tablePropertyIds[idx1] = this.tablePropertyIds[idx2];
    this.tablePropertyIds[idx2] = tmp;
  }

  @action.bound
  setColumnOrderChangeAttendants(
    idSource: string | undefined,
    idTarget: string | undefined
  ): void {
    console.log(idSource, idTarget);
    this.columnOrderChangingTargetId = idTarget;
    this.columnOrderChangingSourceId = idSource;
  }

  @computed get dataTable() {
    return getDataTable(this);
  }

  parent?: any;
}