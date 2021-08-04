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

import { scopeFor } from "dic/Container";
import { Dropdowner } from "gui/Components/Dropdowner/Dropdowner";
import {
  CtxDataViewHeaderExtension,
  DataViewHeaderExtension,
} from "gui/Components/ScreenElements/DataView";
import { DataViewHeader } from "gui/Components/DataViewHeader/DataViewHeader";
import { DataViewHeaderAction } from "gui/Components/DataViewHeader/DataViewHeaderAction";
import { DataViewHeaderButton } from "gui/Components/DataViewHeader/DataViewHeaderButton";
import { DataViewHeaderButtonGroup } from "gui/Components/DataViewHeader/DataViewHeaderButtonGroup";
import { DataViewHeaderDropDownItem } from "gui/Components/DataViewHeader/DataViewHeaderDropDownItem";
import { DataViewHeaderGroup } from "gui/Components/DataViewHeader/DataViewHeaderGroup";
import { Dropdown } from "gui/Components/Dropdown/Dropdown";
import { DropdownItem } from "gui/Components/Dropdown/DropdownItem";
import { Icon } from "gui/Components/Icon/Icon";
import { FilterDropDown } from "gui/connections/FilterDropDown";
import { MobXProviderContext, Observer, observer } from "mobx-react";
import uiActions from "model/actions-ui-tree";
import { getIsRowMovingDisabled } from "model/actions-ui/DataView/getIsRowMovingDisabled";
import { onColumnConfigurationClick } from "model/actions-ui/DataView/onColumnConfigurationClick";
import { onCopyRowClick } from "model/actions-ui/DataView/onCopyRowClick";
import { onCreateRowClick } from "model/actions-ui/DataView/onCreateRowClick";
import { onDeleteRowClick } from "model/actions-ui/DataView/onDeleteRowClick";
import { onExportToExcelClick } from "model/actions-ui/DataView/onExportToExcelClick";
import { onFilterButtonClick } from "model/actions-ui/DataView/onFilterButtonClick";
import { onMoveRowDownClick } from "model/actions-ui/DataView/onMoveRowDownClick";
import { onMoveRowUpClick } from "model/actions-ui/DataView/onMoveRowUpClick";
import { onNextRowClick } from "model/actions-ui/DataView/onNextRowClick";
import { onPrevRowClick } from "model/actions-ui/DataView/onPrevRowClick";
import { onRecordInfoClick } from "model/actions-ui/RecordInfo/onRecordInfoClick";
import { IAction, IActionMode, IActionType, IActionPlacement } from "model/entities/types/IAction";
import { getIsEnabledAction } from "model/selectors/Actions/getIsEnabledAction";
import { getDataViewLabel } from "model/selectors/DataView/getDataViewLabel";
import { getExpandedGroupRowCount } from "model/selectors/DataView/getExpandedGroupRowCount";
import { getIsAddButtonVisible } from "model/selectors/DataView/getIsAddButtonVisible";
import { getIsCopyButtonVisible } from "model/selectors/DataView/getIsCopyButtonVisible";
import { getIsDelButtonVisible } from "model/selectors/DataView/getIsDelButtonVisible";
import { getIsMoveRowMenuVisible } from "model/selectors/DataView/getIsMoveRowMenuVisible";
import { getPanelViewActions } from "model/selectors/DataView/getPanelViewActions";
import { getSelectedRow } from "model/selectors/DataView/getSelectedRow";
import { getTotalRowCount } from "model/selectors/DataView/getTotalGroupRowCount";
import { getOpenedScreen } from "model/selectors/getOpenedScreen";
import { getGroupingConfiguration } from "model/selectors/TablePanelView/getGroupingConfiguration";
import { getIsFilterControlsDisplayed } from "model/selectors/TablePanelView/getIsFilterControlsDisplayed";
import { SectionViewSwitchers } from "modules/DataView/DataViewTypes";
import { IDataViewToolbarUI } from "modules/DataView/DataViewUI";
import React, { useContext } from "react";
import Measure from "react-measure";
import { onFirstRowClick } from "model/actions-ui/DataView/onFirstRowClick";
import { onLastRowClick } from "model/actions-ui/DataView/onLastRowClick";
import { T } from "utils/translation";
import { getConfigurationManager } from "model/selectors/TablePanelView/getConfigurationManager";
import { computed } from "mobx";
import { getPanelMenuActions } from "model/selectors/DataView/getPanelMenuActions";
import { DropdownDivider } from "gui/Components/Dropdown/DropdownDivider";
import {getTrueSelectedRowIndex} from "../../model/selectors/DataView/getTrueSelectedRowIndex";
import {getAreCrudButtonsEnabled} from "../../model/selectors/DataView/getAreCrudButtonsEnabled";

function isAddRecordShortcut(event: any) {
  return (
    ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === "i") ||
    ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "j")
  );
}

function isDeleteRecordShortcut(event: any) {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === "Delete";
}

function isDuplicateRecordShortcut(event: any) {
  return (
    (event.ctrlKey || event.metaKey) && !event.shiftKey && (event.key === "d" || event.key === "k")
  );
}

function isFilterRecordShortcut(event: any) {
  return (event.ctrlKey || event.metaKey) && event.key === "f";
}

@observer
export class CDataViewHeaderInner extends React.Component<{
  isVisible: boolean;
  extension: DataViewHeaderExtension;
}> {
  static contextType = MobXProviderContext;

  get dataView() {
    return this.context.dataView;
  }

  state = {
    hiddenActionIds: new Set<string>(),
  };

  shouldBeShown(action: IAction) {
    return getIsEnabledAction(action) || action.mode !== IActionMode.ActiveRecord;
  }

  @computed
  get relevantActions() {
    return this.allActions
      .filter((action) => !action.groupId)
      .filter((action) => this.shouldBeShown(action));
  }

  @computed
  get relevantMenuActions() {
    return this.allMenuActions
      .filter((action) => !action.groupId)
      .filter((action) => this.shouldBeShown(action));
  }

  renderMenuActions(args: { setMenuDropped(state: boolean): void }) {
    return this.relevantMenuActions.map((action) => {
      return (
        <DropdownItem
          key={action.id}
          onClick={(event) => {
            args.setMenuDropped(false);
            uiActions.actions.onActionClick(action)(event, action);
          }}
        >
          {action.caption}
        </DropdownItem>
      );
    });
  }

  renderActions() {
    return this.relevantActions.map((action, idx) =>
      this.renderAction(action, this.relevantActions)
    );
  }

  renderAction(action: IAction, actionsToRender: IAction[]) {
    if (action.type === IActionType.Dropdown) {
      const childActions = actionsToRender.filter(
        (otherAction) => otherAction.groupId === action.id
      );
      return (
        <Dropdowner
          style={{ width: "auto" }}
          trigger={({ refTrigger, setDropped }) => (
            <Observer key={action.id}>
              {() => (
                <DataViewHeaderButton
                  title={action.caption}
                  disabled={!getIsEnabledAction(action)}
                  onClick={() => setDropped(true)}
                  domRef={refTrigger}
                >
                  {action.caption}
                </DataViewHeaderButton>
              )}
            </Observer>
          )}
          content={() => (
            <Dropdown>
              {childActions.map((action) => (
                <Observer key={action.id}>
                  {() => (
                    <DropdownItem isDisabled={!getIsEnabledAction(action)}>
                      <DataViewHeaderDropDownItem
                        onClick={(event) => uiActions.actions.onActionClick(action)(event, action)}
                      >
                        {action.caption}
                      </DataViewHeaderDropDownItem>
                    </DropdownItem>
                  )}
                </Observer>
              ))}
            </Dropdown>
          )}
        />
      );
    }
    return (
      <Observer key={action.id}>
        {() => (
          <DataViewHeaderButton
            title={action.caption}
            onClick={(event) => uiActions.actions.onActionClick(action)(event, action)}
            disabled={!getIsEnabledAction(action)}
          >
            {action.caption}
          </DataViewHeaderButton>
        )}
      </Observer>
    );
  }

  renderRowCount() {
    const selectedRowIndex = getTrueSelectedRowIndex(this.dataView);
    const totalRowCount = getTotalRowCount(this.dataView);
    const groupRowCount = getExpandedGroupRowCount(this.dataView);
    if (groupRowCount) {
      return (
        <>
          {selectedRowIndex !== undefined ? selectedRowIndex + 1 : " - "}
          &nbsp;/&nbsp;
          {groupRowCount}
          {totalRowCount ? " (" + totalRowCount + ")" : ""}
        </>
      );
    } else {
      return (
        <>
          {selectedRowIndex !== undefined ? selectedRowIndex + 1 : " - "}
          &nbsp;/&nbsp;
          {totalRowCount}
        </>
      );
    }
  }

  @computed
  get isBarVisible() {
    return this.props.isVisible || this.hasSomeRelevantActions;
  }

  @computed
  get isActionsOnly() {
    return !this.props.isVisible && this.hasSomeRelevantActions;
  }

  @computed
  get hasSomeRelevantActions() {
    return (
      this.relevantActions.filter((action) => action.placement !== IActionPlacement.PanelMenu)
        .length > 0
    );
  }

  @computed
  get allActions() {
    return getPanelViewActions(this.dataView);
  }

  @computed
  get allMenuActions() {
    return getPanelMenuActions(this.dataView);
  }

  render() {
    const { dataView } = this;
    const label = getDataViewLabel(dataView);
    const isFilterSettingsVisible = getIsFilterControlsDisplayed(dataView);
    const onColumnConfigurationClickEvt = onColumnConfigurationClick(dataView);
    const onExportToExcelClickEvt = onExportToExcelClick(dataView);
    const onDeleteRowClickEvt = onDeleteRowClick(dataView);
    const onCreateRowClickEvt = onCreateRowClick(dataView);
    const onMoveRowUpClickEvt = onMoveRowUpClick(dataView);
    const isRowMovingDisabled = getIsRowMovingDisabled(dataView);
    const onMoveRowDownClickEvt = onMoveRowDownClick(dataView);
    const onCopyRowClickEvt = onCopyRowClick(dataView);
    const onFilterButtonClickEvt = onFilterButtonClick(dataView);
    const onFirstRowClickEvt = onFirstRowClick(dataView);
    const onPrevRowClickEvt = onPrevRowClick(dataView);
    const onNextRowClickEvt = onNextRowClick(dataView);
    const onLastRowClickEvt = onLastRowClick(dataView);

    const isMoveRowMenuVisible = getIsMoveRowMenuVisible(dataView);

    const isAddButton = getIsAddButtonVisible(dataView);
    const isDelButton = getIsDelButtonVisible(dataView);
    const isCopyButton = getIsCopyButtonVisible(dataView);
    const crudButtonsEnabled = getAreCrudButtonsEnabled(dataView);

    const $cont = scopeFor(dataView);
    const uiToolbar = $cont && $cont.resolve(IDataViewToolbarUI);
    const selectedRow = getSelectedRow(dataView);
    const isDialog = !!getOpenedScreen(dataView).dialogInfo;

    const goToFirstRowDisabled =
      getGroupingConfiguration(dataView).isGrouping; // || isInfiniteScrollingActive(dataView);
    const goToLastRowDisabled =
      getGroupingConfiguration(dataView).isGrouping; // || isInfiniteScrollingActive(dataView);

    const configurationManager = getConfigurationManager(dataView);
    const customTableConfigsExist = configurationManager.customTableConfigurations.length > 0;
    return (
      <Measure bounds={true}>
        {({ measureRef, contentRect }) => {
          const containerWidth = contentRect.bounds?.width || 0;
          const isBreak640 = containerWidth < 640;
          return (
            <Observer>
              {() => (
                <DataViewHeader domRef={measureRef} isVisible={this.isBarVisible}>
                  {this.isBarVisible &&
                    (this.isActionsOnly ? (
                      <DataViewHeaderGroup grovable={true} noDivider={true}>
                        {this.props.extension.render("actions")}
                        <DataViewHeaderButtonGroup>
                          {this.renderActions()}
                        </DataViewHeaderButtonGroup>
                      </DataViewHeaderGroup>
                    ) : (
                      <>
                        <h2 title={label}>{label}</h2>

                        <div className="fullspaceBlock">
                          {isMoveRowMenuVisible ? (
                            <DataViewHeaderGroup isHidden={false} noShrink={true}>
                              <DataViewHeaderAction
                                onMouseDown={onMoveRowUpClickEvt}
                                isDisabled={isRowMovingDisabled}
                              >
                                <Icon
                                  src="./icons/move-up.svg"
                                  tooltip={T("Move Up", "increase_tool_tip")}
                                />
                              </DataViewHeaderAction>
                              <DataViewHeaderAction
                                onMouseDown={onMoveRowDownClickEvt}
                                isDisabled={isRowMovingDisabled}
                              >
                                <Icon
                                  src="./icons/move-down.svg"
                                  tooltip={T("Move Down", "decrease_tool_tip")}
                                />
                              </DataViewHeaderAction>
                            </DataViewHeaderGroup>
                          ) : null}

                          <DataViewHeaderGroup noShrink={true}>
                            {isAddButton && (
                              <DataViewHeaderAction
                                className={"addRow "+(crudButtonsEnabled ? "isGreenHover" : "")}
                                onClick={onCreateRowClickEvt}
                                onShortcut={onCreateRowClickEvt}
                                isDisabled={!crudButtonsEnabled}
                                shortcutPredicate={isAddRecordShortcut}
                              >
                                <Icon src="./icons/add.svg" tooltip={T("Add", "add_tool_tip")} />
                              </DataViewHeaderAction>
                            )}

                            {isDelButton && !!selectedRow && (
                              <DataViewHeaderAction
                                className="isRedHover"
                                onMouseDown={onDeleteRowClickEvt}
                                onShortcut={onDeleteRowClickEvt}
                                shortcutPredicate={isDeleteRecordShortcut}
                              >
                                <Icon
                                  src="./icons/minus.svg"
                                  tooltip={T("Delete", "delete_tool_tip")}
                                />
                              </DataViewHeaderAction>
                            )}

                            {isCopyButton && !!selectedRow && (
                              <DataViewHeaderAction
                                className="isOrangeHover"
                                onMouseDown={onCopyRowClickEvt}
                                onShortcut={onCopyRowClickEvt}
                                shortcutPredicate={isDuplicateRecordShortcut}
                              >
                                <Icon
                                  src="./icons/duplicate.svg"
                                  tooltip={T("Duplicate", "add_duplicate_tool_tip")}
                                />
                              </DataViewHeaderAction>
                            )}
                          </DataViewHeaderGroup>

                          <DataViewHeaderGroup grovable={true}>
                            {this.props.extension.render("actions")}
                            <DataViewHeaderButtonGroup>
                              {this.renderActions()}
                            </DataViewHeaderButtonGroup>
                          </DataViewHeaderGroup>

                          {!isBreak640 && (
                            <>
                              <DataViewHeaderGroup noShrink={true}>
                                <DataViewHeaderAction
                                  onMouseDown={onFirstRowClickEvt}
                                  isDisabled={goToFirstRowDisabled}
                                >
                                  <Icon
                                    src="./icons/list-arrow-first.svg"
                                    tooltip={T("First", "move_first_tool_tip")}
                                  />
                                </DataViewHeaderAction>
                                <DataViewHeaderAction onMouseDown={onPrevRowClickEvt}>
                                  <Icon
                                    src="./icons/list-arrow-previous.svg"
                                    tooltip={T("Previous", "move_prev_tool_tip")}
                                  />
                                </DataViewHeaderAction>
                                <DataViewHeaderAction onMouseDown={onNextRowClickEvt}>
                                  <Icon
                                    src="./icons/list-arrow-next.svg"
                                    tooltip={T("Next", "move_next_tool_tip")}
                                  />
                                </DataViewHeaderAction>
                                <DataViewHeaderAction
                                  onMouseDown={onLastRowClickEvt}
                                  isDisabled={goToLastRowDisabled}
                                >
                                  <Icon
                                    src="./icons/list-arrow-last.svg"
                                    tooltip={T("Last", "move_last_tool_tip")}
                                  />
                                </DataViewHeaderAction>
                              </DataViewHeaderGroup>

                              <DataViewHeaderGroup noShrink={true}>
                                {this.renderRowCount()}
                              </DataViewHeaderGroup>
                            </>
                          )}

                          <DataViewHeaderGroup noShrink={true}>
                            {uiToolbar && uiToolbar.renderSection(SectionViewSwitchers)}
                          </DataViewHeaderGroup>

                          <DataViewHeaderGroup noShrink={true}>
                            <DataViewHeaderAction
                              onMouseDown={onFilterButtonClickEvt}
                              onShortcut={onFilterButtonClickEvt}
                              shortcutPredicate={isFilterRecordShortcut}
                              isActive={isFilterSettingsVisible}
                              className={"test-filter-button"}
                            >
                              <Icon
                                src="./icons/search-filter.svg"
                                tooltip={T("Filter", "filter_tool_tip")}
                              />
                            </DataViewHeaderAction>
                            <FilterDropDown ctx={dataView} />
                          </DataViewHeaderGroup>
                        </div>

                        <DataViewHeaderGroup noShrink={true}>
                          <Dropdowner
                            trigger={({ refTrigger, setDropped }) => (
                              <DataViewHeaderAction
                                refDom={refTrigger}
                                onMouseDown={() => setDropped(true)}
                                isActive={false}
                              >
                                <Icon
                                  src="./icons/dot-menu.svg"
                                  tooltip={T("Tools", "tools_tool_tip")}
                                />
                              </DataViewHeaderAction>
                            )}
                            content={({ setDropped }) => (
                              <Dropdown>
                                <DropdownItem
                                  onClick={(event: any) => {
                                    setDropped(false);
                                    onExportToExcelClickEvt(event);
                                  }}
                                >
                                  {T("Export to Excel", "excel_tool_tip")}
                                </DropdownItem>
                                <DropdownItem
                                  onClick={(event: any) => {
                                    setDropped(false);
                                    onColumnConfigurationClickEvt(event);
                                  }}
                                >
                                  {T("Column configuration", "column_config_tool_tip")}
                                </DropdownItem>
                                {!isDialog && (
                                  <DropdownItem
                                    isDisabled={false}
                                    onClick={(event: any) => {
                                      setDropped(false);
                                      onRecordInfoClick(dataView)(event);
                                    }}
                                  >
                                    {T("Show record information", "info_button_tool_tip")}
                                  </DropdownItem>
                                )}
                                {customTableConfigsExist && [
                                  <DropdownItem
                                    isDisabled={false}
                                    isSelected={
                                      configurationManager.defaultTableConfiguration.isActive
                                    }
                                    onClick={async (event: any) => {
                                      setDropped(false);
                                      configurationManager.activeTableConfiguration =
                                        configurationManager.defaultTableConfiguration;
                                      await configurationManager.saveTableConfigurations();
                                    }}
                                  >
                                    {T("Default View", "default_grid_view_view")}
                                  </DropdownItem>,
                                  ...configurationManager.customTableConfigurations.map(
                                    (tableConfig) => (
                                      <DropdownItem
                                        isDisabled={false}
                                        isSelected={tableConfig.isActive}
                                        onClick={async (event: any) => {
                                          setDropped(false);
                                          configurationManager.activeTableConfiguration = tableConfig;
                                          await configurationManager.saveTableConfigurations();
                                        }}
                                      >
                                        {tableConfig.name}
                                      </DropdownItem>
                                    )
                                  ),
                                  <DropdownItem
                                    isDisabled={false}
                                    onClick={async (event: any) => {
                                      setDropped(false);
                                      await configurationManager.saveTableConfigurations();
                                    }}
                                  >
                                    {T("Save View", "save_current_column_config")}
                                  </DropdownItem>,
                                  <DropdownItem
                                    isDisabled={
                                      configurationManager.defaultTableConfiguration.isActive
                                    }
                                    onClick={async (event: any) => {
                                      setDropped(false);
                                      await configurationManager.deleteActiveTableConfiguration();
                                    }}
                                  >
                                    {T("Delete View", "delete_current_column_config")}
                                  </DropdownItem>,
                                ]}
                                {this.relevantMenuActions.length > 0 && <DropdownDivider />}
                                {this.renderMenuActions({ setMenuDropped: setDropped })}
                              </Dropdown>
                            )}
                          />
                        </DataViewHeaderGroup>
                      </>
                    ))}
                </DataViewHeader>
              )}
            </Observer>
          );
        }}
      </Measure>
    );
  }
}

export function CDataViewHeader(props: { isVisible: boolean }) {
  const extension = useContext(CtxDataViewHeaderExtension);
  return <CDataViewHeaderInner isVisible={props.isVisible} extension={extension} />;
}
