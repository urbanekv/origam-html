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

import {
  DropdownDataTable,
  IBodyCellDriver,
} from "modules/Editors/DropdownEditor/DropdownTableModel";
import { DropdownEditorBehavior } from "modules/Editors/DropdownEditor/DropdownEditorBehavior";
import { bodyCellClass } from "modules/Editors/DropdownEditor/Cells/CellsCommon";
import React from "react";
import {TypeSymbol} from "dic/Container";
import {TextCellDriver} from "modules/Editors/DropdownEditor/Cells/TextCellDriver";
import moment from "moment";

export class DateCellDriver implements IBodyCellDriver {
  constructor(
    private dataIndex: number,
    private dataTable: DropdownDataTable,
    private behavior: DropdownEditorBehavior,
    private formatterPattern: string
  ) {}

  render(rowIndex: number) {
    const value = this.dataTable.getValue(rowIndex, this.dataIndex);
    const rowId = this.dataTable.getRowIdentifierByIndex(rowIndex);
    let momentValue = moment(value);
    const formattedValue = momentValue.isValid() ? momentValue.format(this.formatterPattern) : "";

    return (
      <div
        className={bodyCellClass(
          rowIndex,
          this.behavior.chosenRowId === rowId,
          this.behavior.cursorRowId === rowId
        )}
        onClick={(e) => {
          this.behavior.handleTableCellClicked(e, rowIndex);
        }}
      >
        {formattedValue}
      </div>
    );
  }
}

export const IDateCellDriver = TypeSymbol<TextCellDriver>("ITextCellDriver");
