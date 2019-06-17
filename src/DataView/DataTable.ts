import { action, observable, computed } from "mobx";
import { L, ML } from "../utils/types";
import { unpack } from "../utils/objects";

import { IProperty } from "./types/IProperty";
import { IRecords } from "./types/IRecords";
import { IProperties } from "./types/IProperties";
import { Property } from "./Property";
import { IDataTable } from "./types/IDataTable";
import { IRecord } from "./types/IRecord";

export class Properties implements IProperties {
  constructor(public P: { propertyItems: ML<IProperty[]> }) {}

  @observable.shallow items: IProperty[] = unpack(this.P.propertyItems);

  @computed get count(): number {
    return this.items.length;
  }

  @computed get ids(): string[] {
    return this.items.map(item => item.id);
  }

  @computed get itemsById() {
    return new Map(
      this.items.map(item => [item.id, item] as [string, IProperty])
    );
  }

  getByIndex(idx: number): IProperty | undefined {
    return this.items[idx];
  }

  getById(id: string): IProperty | undefined {
    return this.items.find(item => item.id === id);
  }

  getIdByIndex(idx: number): string | undefined {
    const prop = this.getByIndex(idx);
    return prop ? prop.id : undefined;
  }

  getIndexById(id: string): number | undefined {
    const idx = this.items.findIndex(item => item.id === id);
    return idx > -1 ? idx : undefined;
  }

  getIdAfterId(id: string): string | undefined {
    const idx = this.getIndexById(id);
    const newIdx = idx !== undefined ? idx + 1 : undefined;
    const newId = newIdx !== undefined ? this.getIdByIndex(newIdx) : undefined;
    return newId;
  }

  getIdBeforeId(id: string): string | undefined {
    const idx = this.getIndexById(id);
    const newIdx = idx !== undefined ? idx - 1 : undefined;
    const newId = newIdx !== undefined ? this.getIdByIndex(newIdx) : undefined;
    return newId;
  }
}

export class Records implements IRecords {
  @observable.shallow items: Array<Array<any>> = [];
  @observable deletedRecordIds: Map<string, boolean> | undefined;

  @computed get count(): number {
    return this.items.length;
  }

  @computed get existingCount(): number {
    return this.existingItems.length;
  }

  @computed get existingItems() {
    const { deletedRecordIds } = this;
    if (!deletedRecordIds) {
      return this.items;
    }
    return this.items.filter(item => !deletedRecordIds.has(item[0]));
  }

  @action.bound markDeleted(recId: string) {
    if (!this.deletedRecordIds) {
      this.deletedRecordIds = new Map();
    }
    this.deletedRecordIds.set(recId, true);
  }

  @action.bound
  removeDirtyDeleted(rowId: string): void {
    if (this.deletedRecordIds) {
      this.deletedRecordIds.delete(rowId);
    }
  }

  @action.bound
  setRecords(records: IRecord[]): void {
    this.items = records;
  }

  @action.bound
  substRecord(rowId: string, record: IRecord) {
    let idx = this.getIndexById(rowId);
    if (idx !== undefined) {
      this.items.splice(idx, 1, record);
    }
  }

  @action.bound
  removeRow(rowId: string): void {
    const idx = this.getFullIndexById(rowId);
    if (idx) {
      this.items.splice(idx, 1);
    }
  }

  getByIndex(idx: number): IRecord | undefined {
    return this.existingItems[idx];
  }

  getById(id: string): IRecord | undefined {
    // TODO: Not finding by id...?
    return this.items.find(item => item[0] === id);
  }

  getIdByIndex(idx: number): string | undefined {
    const rec = this.getByIndex(idx);
    return rec ? rec[0] : undefined;
  }

  getIndexById(id: string): number | undefined {
    const idx = this.existingItems.findIndex(item => item[0] === id);
    return idx > -1 ? idx : undefined;
  }

  getFullIndexById(id: string): number | undefined {
    const idx = this.items.findIndex(item => item[0] === id);
    return idx > -1 ? idx : undefined;
  }

  getIdAfterId(id: string): string | undefined {
    const idx = this.getIndexById(id);
    const newIdx = idx !== undefined ? idx + 1 : undefined;
    const newId = newIdx !== undefined ? this.getIdByIndex(newIdx) : undefined;
    return newId;
  }

  getIdBeforeId(id: string): string | undefined {
    const idx = this.getIndexById(id);
    const newIdx = idx !== undefined ? idx - 1 : undefined;
    const newId = newIdx !== undefined ? this.getIdByIndex(newIdx) : undefined;
    return newId;
  }
}

export class DataTable implements IDataTable {
  constructor(
    public P: {
      records: IRecords;
      properties: IProperties;
    }
  ) {}

  @computed get existingRecordCount(): number {
    return this.records.existingCount;
  }

  @computed get propertyCount(): number {
    return this.properties.count;
  }

  @computed get hasContent(): boolean {
    return this.records.count > 0;
  }

  @observable _dirtyValues:
    | Map<string, Map<string, any>>
    | undefined = undefined;

  @computed get dirtyValues() {
    return this._dirtyValues ? this._dirtyValues : new Map<string, any>();
  }

  @computed get dirtyDeletedIds() {
    return this.records.deletedRecordIds
      ? this.records.deletedRecordIds
      : new Map<string, boolean>();
  }

  @observable newRecordIds: Map<string, boolean> | undefined;

  @action.bound
  setRecords(records: IRecord[]): void {
    this.records.setRecords(records);
  }

  @action.bound
  resetDirty(): void {
    this._dirtyValues = undefined;
  }

  @action.bound
  markDeletedRow(rowId: string): void {
    this.records.markDeleted(rowId);
  }

  @action.bound
  addDirtyValues(recId: string, values: Map<string, any>) {
    if (!this._dirtyValues) {
      this._dirtyValues = new Map();
    }
    if (!this._dirtyValues.get(recId)) {
      this._dirtyValues.set(recId, new Map());
    }
    for (let [propId, value] of values) {
      this._dirtyValues.get(recId)!.set(propId, value);
    }
  }

  getRecordByIdx(idx: number): IRecord | undefined {
    return this.records.getByIndex(idx);
  }

  getRecordById(id: string): IRecord | undefined {
    return this.records.getById(id);
  }

  getValueByIdx(recIdx: number, propIdx: number): any {
    const record = this.getRecordByIdx(recIdx);
    const property = this.properties.getByIndex(propIdx);
    if (record && property) {
      return this.getValue(record, property);
    }
  }

  getValueById(recId: string, propId: string): any {
    const record = this.records.getById(recId);
    const property = this.properties.getById(propId);
    if (record && property) {
      return this.getValue(record, property);
    }
  }

  getValue(record: IRecord, property: IProperty) {
    if (
      this._dirtyValues &&
      this._dirtyValues.has(record[0]) &&
      this._dirtyValues.get(record[0])!.has(property.id)
    ) {
      return this._dirtyValues.get(record[0])!.get(property.id);
    }
    return record[property.dataIndex];
  }

  getRecValueMap(id: string): Map<string, any> {
    const record = this.records.getById(id);
    const result = new Map();
    if (record) {
      for (let prop of this.properties.items) {
        result.set(prop.id, this.getValue(record, prop));
      }
    }
    return result;
  }

  getRecordIndexById(id: string): number | undefined {
    return this.records.getIndexById(id);
  }

  getRecordIdByIndex(idx: number): string | undefined {
    return this.records.getIdByIndex(idx);
  }

  @action.bound
  removeDirtyRow(rowId: string): void {
    if (this._dirtyValues) {
      this._dirtyValues.delete(rowId);
    }
  }

  @action.bound
  removeDirtyDeleted(rowId: string): void {
    this.records.removeDirtyDeleted(rowId);
  }

  @action.bound
  mutateRow(rowId: string, values: { [key: string]: any }) {
    const record = this.records.getById(rowId);
    if (record) {
      const newRecord = [...record];
      for (let prop of this.properties.items) {
        newRecord[prop.dataIndex] =
          values[prop.id] !== undefined
            ? values[prop.id]
            : record[prop.dataIndex];
      }
      this.records.substRecord(rowId, record);
    }
  }

  @action.bound
  removeRow(rowId: string): void {
    this.records.removeRow(rowId);
  }

  @action.bound
  substRecord(rowId: string, record: any[]): void {
    this.records.substRecord(rowId, record);
  }

  @computed get records() {
    return this.P.records;
  }

  @computed get properties() {
    return this.P.properties;
  }
}