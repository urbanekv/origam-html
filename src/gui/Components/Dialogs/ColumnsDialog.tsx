import S from "./ColumnsDialog.module.css";
import React from "react";
import { ModalWindowOverlay, ModalWindow, CloseButton } from "../Dialog/Dialog";
import { AutoSizer, MultiGrid } from "react-virtualized";
import { bind } from "bind-decorator";
import { observable, action } from "mobx";
import { observer, Observer } from "mobx-react";
import produce from "immer";

export interface ITableColumnsConf {
  fixedColumnCount: number;
  columnConf: ITableColumnConf[];
}

export interface ITableColumnConf {
  id: string;
  name: string;
  isVisible: boolean;
  groupingIndex: number;
  aggregation: "";
}

@observer
export class ColumnsDialog extends React.Component<{
  configuration: ITableColumnsConf;
  onOkClick?: (event: any, configuration: ITableColumnsConf) => void;
  onSaveAsClick?: (event: any) => void;
  onCancelClick?: (event: any) => void;
  onCloseClick?: (event: any) => void;
}> {
  constructor(props: any) {
    super(props);
    this.configuration = this.props.configuration;
  }

  @observable.ref configuration: ITableColumnsConf;

  @observable columnWidths = [70, 160, 70, 90];

  refGrid = React.createRef<MultiGrid>();

  @action.bound setVisible(rowIndex: number, state: boolean) {
    this.configuration = produce(this.configuration, draft => {
      draft.columnConf[rowIndex].isVisible = state;
    });
  }

  render() {
    return (
      <ModalWindow
        title="Columns"
        titleButtons={<CloseButton onClick={this.props.onCloseClick} />}
        buttonsCenter={
          <>
            <button
              onClick={(event: any) =>
                this.props.onOkClick &&
                this.props.onOkClick(event, this.configuration)
              }
            >
              OK
            </button>
            <button onClick={this.props.onSaveAsClick}>Save As...</button>
            <button onClick={this.props.onCancelClick}>Cancel</button>
          </>
        }
        buttonsLeft={null}
        buttonsRight={null}
      >
        <div className={S.columnTable}>
          <AutoSizer>
            {({ width, height }) => (
              <Observer>
                {() => (
                  <MultiGrid
                    ref={this.refGrid}
                    fixedRowCount={1}
                    cellRenderer={this.renderCell}
                    columnCount={4}
                    rowCount={1 + this.configuration.columnConf.length}
                    columnWidth={({ index }: { index: number }) => {
                      return this.columnWidths[index];
                    }}
                    rowHeight={20}
                    width={width}
                    height={height}
                  />
                )}
              </Observer>
            )}
          </AutoSizer>
        </div>
        <div className={S.lockedColumns}>
          Locked columns count
          <input
            className={S.lockedColumnsInput}
            type="text"
            value={this.configuration.fixedColumnCount}
          />
        </div>
      </ModalWindow>
    );
  }

  getCell(rowIndex: number, columnIndex: number) {
    const {
      isVisible,
      name,
      aggregation,
      groupingIndex
    } = this.configuration.columnConf[rowIndex];
    switch (columnIndex) {
      case 0:
        return (
          <input
            type="checkbox"
            key={`${rowIndex}@${columnIndex}`}
            onChange={(event: any) =>
              this.setVisible(rowIndex, event.target.checked)
            }
            checked={isVisible}
          />
        );
      case 1:
        return name;
      case 2:
        return (
          <span>
            <input
              type="checkbox"
              key={`${rowIndex}@${columnIndex}`}
              checked={groupingIndex > 0}
            />{" "}
            {groupingIndex > 0 ? groupingIndex : ""}
          </span>
        );
      case 4:
        return "";
      default:
        return "";
    }
  }

  @bind renderCell(args: {
    columnIndex: number;
    rowIndex: number;
    style: any;
    key: any;
  }): React.ReactNode {
    if (args.rowIndex > 0) {
      const rowClassName = args.rowIndex % 2 === 0 ? "even" : "odd";
      return (
        <Observer>
          {() => (
            <div
              style={args.style}
              className={S.columnTableCell + " " + rowClassName}
            >
              {this.getCell(args.rowIndex - 1, args.columnIndex)}
            </div>
          )}
        </Observer>
      );
    } else {
      return (
        <Observer>
          {() => (
            <TableHeader
              columnIndex={args.columnIndex}
              style={args.style}
              columnWidth={this.columnWidths[args.columnIndex]}
              onColumnWidthChange={this.handleColumnWidthChange}
            />
          )}
        </Observer>
      );
    }
  }

  @action.bound handleColumnWidthChange(columnIndex: number, newWidth: number) {
    if (newWidth >= 30) {
      this.columnWidths[columnIndex] = newWidth;
      this.refGrid.current!.recomputeGridSize();
    }
  }
}

@observer
export class TableHeader extends React.Component<{
  columnIndex: number;
  columnWidth: number;
  style: any;
  onColumnResizeStart?: (columnIndex: number) => void;
  onColumnWidthChange?: (columnIndex: number, newWidth: number) => void;
  onColumnResizeEnd?: (columnIndex: number) => void;
}> {
  getHeader(columnIndex: number) {
    switch (columnIndex) {
      case 0:
        return "Visible";
      case 1:
        return "Name";
      case 2:
        return "GroupBy";
      case 3:
        return "Aggregation";
      default:
        return "?";
    }
  }

  width0 = 0;
  mouseX0 = 0;

  @action.bound handleColumnWidthHandleMouseDown(event: any) {
    event.preventDefault();
    this.width0 = this.props.columnWidth;
    this.mouseX0 = event.screenX;
    window.addEventListener("mousemove", this.handleWindowMouseMove);
    window.addEventListener("mouseup", this.handleWindowMouseUp);
  }

  @action.bound handleWindowMouseMove(event: any) {
    const vec = event.screenX - this.mouseX0;
    const newWidth = this.width0 + vec;
    console.log(this.props.columnIndex, newWidth);
    this.props.onColumnWidthChange &&
      this.props.onColumnWidthChange(this.props.columnIndex, newWidth);
  }

  @action.bound handleWindowMouseUp(event: any) {
    window.removeEventListener("mousemove", this.handleWindowMouseMove);
    window.removeEventListener("mouseup", this.handleWindowMouseUp);
  }

  render() {
    return (
      <div style={this.props.style} className={S.columnTableCell + " header"}>
        {this.getHeader(this.props.columnIndex)}
        <div
          className={S.columnWidthHandle}
          onMouseDown={this.handleColumnWidthHandleMouseDown}
        />
      </div>
    );
  }
}