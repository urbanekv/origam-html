import * as React from "react";
import { observer, Observer, inject } from "mobx-react";
import { action, observable, computed, runInAction } from "mobx";
import S from "./DropdownEditor.module.css";
import CS from "./CommonStyle.module.css";

import _ from "lodash";
import { MultiGrid, AutoSizer } from "react-virtualized";
import Highlighter from "react-highlight-words";
import { IApi } from "../../../../model/entities/types/IApi";
import { getApi } from "../../../../model/selectors/getApi";
import { getDataTable } from "../../../../model/selectors/DataView/getDataTable";
import { getDataStructureEntityId } from "../../../../model/selectors/DataView/getDataStructureEntityId";
import { ILookup } from "../../../../model/entities/types/ILookup";
import { IProperty } from '../../../../model/entities/types/IProperty';
import { getSelectedRowId } from "../../../../model/selectors/TablePanelView/getSelectedRowId";
import { getMenuItemId } from "../../../../model/selectors/getMenuItemId";



export interface IDropdownEditorProps {
  value: string;
  textualValue?: string;
  isReadOnly: boolean;
  isInvalid: boolean;
  isFocused: boolean;

  DataStructureEntityId?: string;
  ColumnNames?: string[];
  Property?: string;
  RowId?: string;
  LookupId?: string;
  menuItemId?: string;

  refocuser?: (cb: () => void) => () => void;
  onTextChange?(event: any, value: string): void;
  onItemSelect?(event: any, value: string): void;
  onKeyDown?(event: any): void;
  onClick?(event: any): void;
  api?: IApi;
}


// TODO: Change connection for FormView - e.g. RowId may be found differently for different panel views.
@inject(({property}: {property: IProperty}, {value}) => {
  const dataTable = getDataTable(property);
  const lookup = property.lookup!;
  return {
    api: getApi(property),
    textualValue: dataTable.resolveCellText(property, value),
    DataStructureEntityId: getDataStructureEntityId(property),
    ColumnNames: lookup.dropDownColumns.map(column => column.id),
    Property: property.id,
    RowId: getSelectedRowId(property),
    LookupId: lookup.lookupId,
    menuItemId: getMenuItemId(property),

  }
})
@observer
export class DropdownEditor extends React.Component<IDropdownEditorProps> {
  constructor(props: IDropdownEditorProps) {
    super(props);
  }

  disposers: any[] = [];

  @observable isDroppedDown = false;
  @observable dirtyTextualValue: string | undefined;
  @observable.ref lookupItems: any[] = [];
  @observable willReload = false;
  @observable isLoading = false;

  componentDidMount() {
    this.props.refocuser &&
      this.disposers.push(this.props.refocuser(this.makeFocusedIfNeeded));
    this.makeFocusedIfNeeded();
  }

  componentWillUnmount() {
    this.disposers.forEach(d => d());
  }

  componentDidUpdate(prevProps: { isFocused: boolean; textualValue?: string }) {
    runInAction(() => {
      if (!prevProps.isFocused && this.props.isFocused) {
        this.makeFocusedIfNeeded();
      }
      if (prevProps.textualValue !== this.props.textualValue) {
        this.dirtyTextualValue = undefined;
        this.makeFocusedIfNeeded();
      }
    });
  }

  @action.bound
  makeFocusedIfNeeded() {
    if (this.props.isFocused) {
      console.log("--- MAKE FOCUSED ---");
      this.elmInput && this.elmInput.focus();
      setTimeout(() => {
        this.elmInput && this.elmInput.select();
      }, 10);
    }
  }

  elmInput: HTMLInputElement | null = null;
  refInput = (elm: HTMLInputElement | any) => {
    this.elmInput = elm;
  };

  @action.bound
  handleTextChange(event: any) {
    this.dirtyTextualValue = event.target.value;
    this.makeDroppedDown();
    this.loadItems();
  }

  @action.bound loadItems() {
    this.willReload = true;
    this.loadItemsDebounced();
  }

  loadItemsDebounced = _.debounce(this.loadItemsImmediately, 300);

  @action.bound loadItemsImmediately() {
    if (!this.api) {
      return;
    }
    this.willReload = false;
    this.isLoading = true;
    this.api
      .getLookupListEx({
        DataStructureEntityId: this.props.DataStructureEntityId!, // Data view entity identifier
        ColumnNames: ["Id", ...this.props.ColumnNames], // Columns to download
        Property: this.props.Property!, // Columnn Id
        Id: this.props.RowId!, // Id of the selected row
        LookupId: this.props.LookupId!, // Id of the lookup objet
        MenuId: this.props.menuItemId!,
        ShowUniqueValues: false,
        SearchText:
          this.dirtyTextualValue !== undefined ? this.dirtyTextualValue : "",
        PageSize: 10000,
        PageNumber: 1
      })
      .then(
        action((lookupItems: any) => {
          console.log("Loaded lookup list items:", lookupItems);
          this.lookupItems = lookupItems;
          this.isLoading = false;
        })
      )
      .catch(
        action((error: any) => {
          this.isLoading = false;
        })
      );
  }

  @action.bound handleDropperClick(event: any) {
    event.stopPropagation();
    this.makeDroppedDown();
  }

  @action.bound makeDroppedDown() {
    if (!this.isDroppedDown) {
      this.isDroppedDown = true;
      window.addEventListener("click", this.handleWindowClick);
      this.loadItemsImmediately();
    }
  }

  @action.bound makeDroppedUp() {
    if (this.isDroppedDown) {
      this.isDroppedDown = false;
      this.dirtyTextualValue = undefined;
      window.removeEventListener("click", this.handleWindowClick);
    }
  }

  @action.bound handleWindowClick(event: any) {
    if (this.elmContainer && !this.elmContainer.contains(event.target)) {
      this.makeDroppedUp();
    }
  }

  refContainer = (elm: HTMLDivElement | null) => (this.elmContainer = elm);
  elmContainer: HTMLDivElement | null = null;

  @computed get value() {
    return this.dirtyTextualValue !== undefined
      ? this.dirtyTextualValue
      : this.props.textualValue;
  }

  cellRenderer = (args: {
    rowIndex: number;
    columnIndex: number;
    key: string;
    style: any;
  }) => {
    const handleClick = (event: any) => {
      // this.dirtyTextualValue = this.lookupItems[args.rowIndex - 1][1];
      if (args.rowIndex > 0) {
        this.dirtyTextualValue = undefined;
        this.props.onItemSelect &&
          this.props.onItemSelect(
            event,
            this.lookupItems[args.rowIndex - 1][0]
          );
        this.makeFocusedIfNeeded();
      }
    };
    return (
      <Observer>
        {() => (
          <div
            style={args.style}
            className={
              (args.rowIndex === 0
                ? S.lookupListHeaderCell
                : S.lookupListItemCell) +
              " " +
              (args.rowIndex % 2 === 0 ? S.evenItem : S.oddItem)
            }
            onClick={handleClick}
          >
            {args.rowIndex === 0 ? (
              this.props.ColumnNames![args.columnIndex]
            ) : (
              <Highlighter
                textToHighlight={
                  this.lookupItems[args.rowIndex - 1][args.columnIndex + 1]
                }
                searchWords={
                  [this.dirtyTextualValue].filter(item => item) as string[]
                }
                autoEscape={true}
              />
            )}
          </div>
        )}
      </Observer>
    );
  };

  render() {
    return (
      <div
        className={CS.editorContainer}
        ref={this.refContainer}
        style={{
          zIndex: this.isDroppedDown ? 1000 : undefined
        }}
      >
        <input
          className={CS.editor}
          type="text"
          value={this.value}
          readOnly={this.props.isReadOnly}
          ref={this.refInput}
          onChange={this.handleTextChange}
          onKeyDown={this.props.onKeyDown}
          onClick={this.props.onClick}
        />
        {this.props.isInvalid && (
          <div className={CS.notification}>
            <i className="fas fa-exclamation-circle red" />
          </div>
        )}
        {!this.props.isReadOnly && (
          <div className={S.dropdownSymbol} onClick={this.handleDropperClick}>
            {!(this.willReload || this.isLoading) && (
              <i className="fas fa-caret-down" />
            )}
            {(this.willReload || this.isLoading) && (
              <i
                className={"fas fa-sync" + (this.isLoading ? " fa-spin" : "")}
              />
            )}
          </div>
        )}
        {this.isDroppedDown && (
          <div className={S.droppedPanelContainer}>
            <AutoSizer>
              {({ width, height }) => (
                <Observer>
                  {() => (
                    <MultiGrid
                      fixedRowCount={1}
                      width={width}
                      height={height}
                      rowCount={this.lookupItems.length + 1}
                      columnCount={this.props.ColumnNames!.length}
                      rowHeight={20}
                      columnWidth={200}
                      cellRenderer={this.cellRenderer}
                    />
                  )}
                </Observer>
              )}
            </AutoSizer>
          </div>
        )}
      </div>
    );
  }

  get api() {
    return this.props.api!;
  }
}