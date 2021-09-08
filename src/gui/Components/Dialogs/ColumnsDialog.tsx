/*
Copyright 2005 - 2021 Advantage Solutions, s. r. o.

This file is part of ORIGAM (http://www.origam.org).

ORIGAM is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ORIGAM is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ORIGAM. If not, see <http://www.gnu.org/licenses/>.
*/

import S from "./ColumnsDialog.module.css";
import React from "react";
import { CloseButton, ModalWindow } from "../Dialog/Dialog";
import { AutoSizer, MultiGrid } from "react-virtualized";
import { bind } from "bind-decorator";
import { action, observable } from "mobx";
import { observer, Observer } from "mobx-react";
import { Dropdowner } from "../Dropdowner/Dropdowner";
import { DataViewHeaderAction } from "../DataViewHeader/DataViewHeaderAction";
import { Dropdown } from "../Dropdown/Dropdown";
import { DropdownItem } from "../Dropdown/DropdownItem";
import {
  AggregationType,
  tryParseAggregationType,
} from "../../../model/entities/types/AggregationType";
import { T } from "../../../utils/translation";
import { rowHeight } from "gui/Components/ScreenElements/Table/TableRendering/cells/cellsCommon";
import {
  GroupingUnit,
  GroupingUnitToLabel as groupingUnitToLabel,
} from "model/entities/types/GroupingUnit";
import { ITableConfiguration } from "model/entities/TablePanelView/types/IConfigurationManager";
import { IColumnOptions } from "model/entities/TablePanelView/ColumnConfigurationDialog";

@observer
export class ColumnsDialog extends React.Component<{
  columnOptions: Map<string, IColumnOptions>;
  configuration: ITableConfiguration;
  onOkClick?: (configuration: ITableConfiguration) => void;
  onSaveAsClick: (event: any, configuration: ITableConfiguration) => void;
  onCancelClick?: (event: any) => void;
  onCloseClick?: (event: any) => void;
}> {
  constructor(props: any) {
    super(props);
    this.configuration = this.props.configuration;
  }

  configuration: ITableConfiguration;

  @observable columnWidths = [70, 160, 70, 70, 90];

  refGrid = React.createRef<MultiGrid>();

  @action.bound setVisible(rowIndex: number, state: boolean) {
    this.configuration.columnConfigurations[rowIndex].isVisible = state;
  }

  @action.bound setGrouping(rowIndex: number, state: boolean, entity: string) {
    if (entity === "Date") {
      if (state) {
        this.setTimeGroupingUnit(rowIndex, GroupingUnit.Day);
      } else {
        this.setTimeGroupingUnit(rowIndex, undefined);
      }
    }

    const columnConfCopy = [...this.configuration.columnConfigurations];
    columnConfCopy.sort((a, b) => b.groupingIndex - a.groupingIndex);
    if (this.configuration.columnConfigurations[rowIndex].groupingIndex === 0) {
      this.configuration.columnConfigurations[rowIndex].groupingIndex =
        columnConfCopy[0].groupingIndex + 1;
    } else {
      this.configuration.columnConfigurations[rowIndex].groupingIndex = 0;
      let groupingIndex = 1;
      columnConfCopy.reverse();
      for (let columnConfItem of columnConfCopy) {
        if (columnConfItem.groupingIndex > 0) {
          columnConfItem.groupingIndex = groupingIndex++;
        }
      }
    }
  }

  @action.bound setTimeGroupingUnit(rowIndex: number, groupingUnit: GroupingUnit | undefined) {
    this.configuration.columnConfigurations[rowIndex].timeGroupingUnit = groupingUnit;
  }

  @action.bound setAggregation(rowIndex: number, selectedAggregation: any) {
    this.configuration.columnConfigurations[rowIndex].aggregationType = tryParseAggregationType(
      selectedAggregation
    );
  }

  @action.bound handleFixedColumnsCountChange(event: any) {
    this.configuration.fixedColumnCount = parseInt(event.target.value, 10);
  }

  render() {
    return (
      <ModalWindow
        title={T("Columns", "column_config_title")}
        titleButtons={<CloseButton onClick={this.props.onCloseClick} />}
        buttonsCenter={
          <>
            <button
              id={"columnConfigOk"}
              tabIndex={0}
              onClick={(event: any) =>
                this.props.onOkClick && this.props.onOkClick(this.configuration)
              }
            >
              {T("OK", "button_ok")}
            </button>
            <button onClick={(event) => this.props.onSaveAsClick(event, this.configuration)}>
              {T("Save As...", "column_config_save_as")}
            </button>
            <button tabIndex={0} onClick={this.props.onCancelClick}>
              {T("Cancel", "button_cancel")}
            </button>
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
                    columnCount={5}
                    rowCount={1 + this.configuration.columnConfigurations.length}
                    columnWidth={({ index }: { index: number }) => {
                      return this.columnWidths[index];
                    }}
                    rowHeight={rowHeight}
                    width={width}
                    height={height}
                  />
                )}
              </Observer>
            )}
          </AutoSizer>
        </div>
        <div className={S.lockedColumns}>
          {T("Locked columns count", "column_config_locked_columns_count")}
          <input
            className={S.lockedColumnsInput}
            type="number"
            min={0}
            value={"" + this.configuration.fixedColumnCount}
            onChange={this.handleFixedColumnsCountChange}
          />
        </div>
      </ModalWindow>
    );
  }

  getCell(rowIndex: number, columnIndex: number) {
    const {
      isVisible,
      propertyId,
      aggregationType,
      groupingIndex,
      timeGroupingUnit,
    } = this.configuration.columnConfigurations[rowIndex];

    const { name, entity, canGroup, canAggregate, modelInstanceId } = this.props.columnOptions.get(propertyId)!;

    switch (columnIndex) {
      case 0:
        return (
          <input
            type="checkbox"
            key={`${rowIndex}@${columnIndex}`}
            onChange={(event: any) => this.setVisible(rowIndex, event.target.checked)}
            checked={isVisible}
          />
        );
      case 1:
        return name;
      case 2:
        return (
          <span id={"group_index_" + modelInstanceId}>
            <input
              id={"group_by_" + modelInstanceId}
              type="checkbox"
              key={`${rowIndex}@${columnIndex}`}
              checked={groupingIndex > 0}
              onChange={(event: any) => this.setGrouping(rowIndex, event.target.checked, entity)}
              disabled={!canGroup}
            />{" "}
            {groupingIndex > 0 ? groupingIndex : ""}
          </span>
        );
      case 3:
        if (groupingIndex > 0 && entity === "Date") {
          return (
            <Dropdowner
              trigger={({ refTrigger, setDropped }) => (
                <DataViewHeaderAction
                  refDom={refTrigger}
                  onMouseDown={() => setDropped(true)}
                  isActive={false}
                >
                  {groupingUnitToLabel(timeGroupingUnit)}
                </DataViewHeaderAction>
              )}
              content={({ setDropped }) => (
                <Dropdown>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setTimeGroupingUnit(rowIndex, GroupingUnit.Year);
                    }}
                  >
                    {groupingUnitToLabel(GroupingUnit.Year)}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setTimeGroupingUnit(rowIndex, GroupingUnit.Month);
                    }}
                  >
                    {groupingUnitToLabel(GroupingUnit.Month)}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setTimeGroupingUnit(rowIndex, GroupingUnit.Day);
                    }}
                  >
                    {groupingUnitToLabel(GroupingUnit.Day)}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setTimeGroupingUnit(rowIndex, GroupingUnit.Hour);
                    }}
                  >
                    {groupingUnitToLabel(GroupingUnit.Hour)}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setTimeGroupingUnit(rowIndex, GroupingUnit.Minute);
                    }}
                  >
                    {groupingUnitToLabel(GroupingUnit.Minute)}
                  </DropdownItem>
                </Dropdown>
              )}
            />
          );
        } else {
          return "";
        }
      case 4:
        if (
          (entity === "Currency" ||
            entity === "Integer" ||
            entity === "Float" ||
            entity === "Long") &&
          canAggregate
        ) {
          return (
            <Dropdowner
              trigger={({ refTrigger, setDropped }) => (
                <DataViewHeaderAction
                  refDom={refTrigger}
                  onMouseDown={() => setDropped(true)}
                  isActive={false}
                >
                  {aggregationType}
                </DataViewHeaderAction>
              )}
              content={({ setDropped }) => (
                <Dropdown>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setAggregation(rowIndex, undefined);
                    }}
                  ></DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setAggregation(rowIndex, AggregationType.SUM);
                    }}
                  >
                    {T("SUM", "aggregation_sum")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setAggregation(rowIndex, AggregationType.AVG);
                    }}
                  >
                    {T("AVG", "aggregation_avg")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setAggregation(rowIndex, AggregationType.MIN);
                    }}
                  >
                    {T("MIN", "aggregation_min")}
                  </DropdownItem>
                  <DropdownItem
                    onClick={(event: any) => {
                      setDropped(false);
                      this.setAggregation(rowIndex, AggregationType.MAX);
                    }}
                  >
                    {T("MAX", "aggregation_max")}
                  </DropdownItem>
                </Dropdown>
              )}
            />
          );
        } else {
          return "";
        }
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
    const Obsv = Observer as any;
    if (args.rowIndex > 0) {
      const rowClassName = args.rowIndex % 2 === 0 ? "even" : "odd";
      return (
        <Obsv style={args.style} key={args.key}>
          {() => (
            <div style={args.style} className={S.columnTableCell + " " + rowClassName}>
              {this.getCell(args.rowIndex - 1, args.columnIndex)}
            </div>
          )}
        </Obsv>
      );
    } else {
      return (
        <Obsv style={args.style} key={args.key}>
          {() => (
            <TableHeader
              columnIndex={args.columnIndex}
              style={args.style}
              columnWidth={this.columnWidths[args.columnIndex]}
              onColumnWidthChange={this.handleColumnWidthChange}
            />
          )}
        </Obsv>
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
        return T("Visible", "column_config_visible");
      case 1:
        return T("Name", "column_config_name");
      case 2:
        return T("GroupBy", "column_config_group_by");
      case 3:
        return T("Grouping unit", "column_config_time_grouping_unit");
      case 4:
        return T("Aggregation", "column_config_aggregation");
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
        <div className={S.columnWidthHandle} onMouseDown={this.handleColumnWidthHandleMouseDown} />
      </div>
    );
  }
}
