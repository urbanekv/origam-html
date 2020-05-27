import {action, computed, observable} from "mobx";
import {SCROLL_DATA_INCREMENT_SIZE} from "../../gui/Workbench/ScreenArea/TableView/InfiniteScrollLoader";


export interface IRowsContainer {
  clear(): void;

  rowIdGetter(row: any[]): string

  delete(row: any[]): void;

  insert(index: number, row: any[]): void;

  set(rows: any[][]): void;

  substitute(row: any[]): void;

  maxRowCountSeen: number;

  rows: any[];
}

export class ListRowContainer implements IRowsContainer {
  @observable.shallow allRows: any[][] = [];
  rowIdGetter: (row: any[]) => string = null as any

  get rows() {
    return this.allRows;
  }

  clear(): void {
    this.allRows.length = 0;
  }

  delete(row: any[]): void {
    const idx = this.allRows.findIndex(
      r => this.rowIdGetter(r) === this.rowIdGetter(row)
    );
    if (idx > -1) {
      this.allRows.splice(idx, 1);
    }
  }

  insert(index: number, row: any[]): void {
    const idx = this.allRows.findIndex(
      r => this.rowIdGetter(r) === this.rowIdGetter(row)
    );
    if (idx > -1) {
      this.allRows.splice(idx, 0, row);
    } else {
      this.allRows.push(row);
    }
  }

  set(rows: any[][]) {
    this.clear();
    this.allRows.push(...rows);
  }

  substitute(row: any[]): void {
    const idx = this.allRows.findIndex(
      r => this.rowIdGetter(r) === this.rowIdGetter(row)
    );
    if (idx > -1) {
      this.allRows.splice(idx, 1, row);
    }
  }

  get maxRowCountSeen(){
    return this.allRows.length;
  }
}

const ROW_CHUNK_SIZE: number = SCROLL_DATA_INCREMENT_SIZE;

export class ScrollRowContainer implements IRowsContainer {

  @observable
  rowChunks: RowChunk[] = [];
  maxChunksToHold = 3;

  rowIdGetter: (row: any[]) => string = null as any
  _maxRowNumberSeen = 0;

  @computed
  get maxRowCountSeen(){
    const maxRowsNow = this.rowChunks.length === 0
      ? 0
      : this.rowChunks[this.rowChunks.length - 1].rowOffset + this.rowChunks[this.rowChunks.length - 1].length;
    if(maxRowsNow > this._maxRowNumberSeen){
      this._maxRowNumberSeen = maxRowsNow;
    }

    return this._maxRowNumberSeen;
  }

  get rows() {
    return this.rowChunks.flatMap(chunk => chunk.rows);
  }

  clear(): void {
    this.rowChunks.length = 0;
  }

  delete(row: any[]): void {
    throw new Error("Method not implemented");
  }

  insert(index: number, row: any[]): void {
    throw new Error("Method not implemented");
  }

  @action.bound
  set(rows: any[][]) {
    this.clear();
    this.rowChunks.push(new RowChunk(0, rows));
  }

  substitute(row: any[]): void {
    for (let chunk of this.rowChunks) {
      const foundAndSubstituted = chunk.trySubstitute(row, this.rowIdGetter);
      if(foundAndSubstituted){
        return;
      }
    }
  }

  get nextEndOffset() {
    return this.rowChunks.length === 0
      ? ROW_CHUNK_SIZE
      : this.rowChunks[this.rowChunks.length - 1].rowOffset + ROW_CHUNK_SIZE
  }

  get nextStartOffset() {
    return this.rowChunks.length === 0 || this.rowChunks[0].rowOffset < ROW_CHUNK_SIZE
      ? 0
      : this.rowChunks[0].rowOffset - ROW_CHUNK_SIZE;
  }

  @action.bound
  prependRecords(rows: any[][]) {
    if(this.rowChunks.length === 0){
      this.set(rows);
      return;
    }
    const rowOffset = this.rowChunks[0].rowOffset - ROW_CHUNK_SIZE;
    this.rowChunks.unshift(new RowChunk(rowOffset, rows))
    if (this.rowChunks.length > this.maxChunksToHold) {
      this.rowChunks.pop();
    }
  }

  @action.bound
  appendRecords(rows: any[][]) {
    if(this.rowChunks.length === 0){
      this.set(rows);
      return;
    }
    const rowOffset = this.rowChunks[this.rowChunks.length - 1].rowOffset + ROW_CHUNK_SIZE;
    this.rowChunks.push(new RowChunk(rowOffset, rows))
    if (this.rowChunks.length > this.maxChunksToHold) {
      this.rowChunks.shift();
    }
  }

  @computed
  get isLastLoaded() {
    return this.rowChunks.length === 0
      ? false
      : this.rowChunks[this.rowChunks.length - 1].isFinal;
  }

  @computed
  get isFirstLoaded() {
    return this.rowChunks.length === 0
      ? false
      : this.rowChunks[0].isInitial;
  }
}


class RowChunk {
  rowOffset: number;
  rows: any[];

  constructor(rowOffset: number, rows: any[]) {
    if(rowOffset < 0){
      throw new Error("Offset cannot be less than 0");
    }
    this.rowOffset = rowOffset;
    this.rows = rows;
  }

  get isInitial(){
    return this.rowOffset === 0;
  }
  get isFinal(){
    return this.rows.length < ROW_CHUNK_SIZE;
  }

  get length(){
    return this.rows.length;
  }

  trySubstitute(row: any[], rowIdGetter: (row: any[]) => string) {
    const index = this.rows.findIndex(row => rowIdGetter(row) === rowIdGetter(row)
    );
    if (index > -1) {
      this.rows.splice(index, 1, row);
      return true;
    }else{
      return false;
    }
  }
}

