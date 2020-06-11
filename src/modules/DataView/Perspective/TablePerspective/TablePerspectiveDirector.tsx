import React from "react";
import { action, flow } from "mobx";
import { IDataViewToolbarUI, IDataViewBodyUI } from "modules/DataView/DataViewUI";
import { TypeSymbol } from "dic/Container";
import { SectionViewSwitchers } from "modules/DataView/DataViewTypes";
import { IIId, getIdent } from "utils/common";
import { DataViewHeaderAction } from "gui02/components/DataViewHeader/DataViewHeaderAction";
import { Icon } from "gui02/components/Icon/Icon";

import { Observer } from "mobx-react";
import { ITablePerspective } from "./TablePerspective";
import { IPerspective, IPerspectiveContrib } from "../Perspective";
import { TableView } from "gui/Workbench/ScreenArea/TableView/TableView";

export class TablePerspectiveDirector implements IIId {
  $iid = getIdent();

  constructor(
    public dataViewToolbarUI = IDataViewToolbarUI(),
    public dataViewBodyUI = IDataViewBodyUI(),
    public tablePerspective = ITablePerspective(),
    public perspective = IPerspective()
  ) {}

  @action.bound
  setup() {
    this.dataViewBodyUI.contrib.put({
      $iid: this.$iid,
      render: () => (
        <Observer key={this.$iid}>
          {() => (
            <div
              style={{
                // width: "100%",
                // height: "100%",
                flexGrow: 1,
                flexDirection: "column",
                position: "relative",
                display: !this.tablePerspective.isActive ? "none" : "flex",
              }}
            >
              <TableView />
            </div>
          )}
        </Observer>
      ),
    });

    this.dataViewToolbarUI.contrib.put({
      $iid: this.$iid,
      section: SectionViewSwitchers,
      render: () => (
        <Observer key={this.$iid}>
          {() => (
            <DataViewHeaderAction
              onClick={flow(this.tablePerspective.handleToolbarBtnClick)}
              isActive={this.tablePerspective.isActive}
            >
              <Icon src="./icons/table-view.svg" />
            </DataViewHeaderAction>
          )}
        </Observer>
      ),
    });

    this.perspective.contrib.put(this.tablePerspective);
  }

  @action.bound
  teardown() {
    this.dataViewBodyUI.contrib.del(this);
    this.dataViewToolbarUI.contrib.del(this);
    this.perspective.contrib.del(this.tablePerspective);
  }

  dispose() {
    this.teardown();
  }
}

export const ITablePerspectiveDirector = TypeSymbol<TablePerspectiveDirector>(
  "ITablePerspectiveDirector"
);