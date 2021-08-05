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

import React from "react";
import { ModalWindow } from "../Dialog/Dialog";
import { observer } from "mobx-react";
import CS from "./DialogsCommon.module.css";
import { T } from "../../../utils/translation";

@observer
export class QuestionDeleteData extends React.Component<{
  screenTitle: string;
  onNoClick?: (event: any) => void;
  onYesClick?: (event: any) => void;
}> {
  refPrimaryBtn = (elm: any) => (this.elmPrimaryBtn = elm);
  elmPrimaryBtn: any;

  componentDidMount() {
    setTimeout(() => {
      if (this.elmPrimaryBtn) {
        this.elmPrimaryBtn.focus?.();
      }
    }, 150);
  }


  render() {
    return (
      <ModalWindow
        title={T("Question", "question_title")}
        titleButtons={null}
        buttonsCenter={
          <>
            <button
              id={"yesButton"}
              ref={this.refPrimaryBtn}
              tabIndex={0}
              autoFocus={true}
              onClick={this.props.onYesClick}
            >
              {T("Yes", "button_yes")}
            </button>
            <button
              id={"noButton"}
              tabIndex={0}
              onClick={this.props.onNoClick}
            >
              {T("No", "button_no")}
            </button>
          </>
        }
        buttonsLeft={null}
        buttonsRight={null}
      >
        <div className={CS.dialogContent}>{T("Delete selected row?", "delete_confirmation")}</div>
      </ModalWindow>
    );
  }
}
