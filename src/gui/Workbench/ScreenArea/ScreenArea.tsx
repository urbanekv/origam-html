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

import { CloseButton, ModalWindow } from "gui/Components/Dialog/Dialog";
import { observer, Observer } from "mobx-react";
import { onScreenTabCloseClick } from "model/actions-ui/ScreenTabHandleRow/onScreenTabCloseClick";
import { onSelectionDialogActionButtonClick } from "model/actions-ui/SelectionDialog/onSelectionDialogActionButtonClick";
import { getIsScreenOrAnyDataViewWorking } from "model/selectors/FormScreen/getIsScreenOrAnyDataViewWorking";
import { getDialogStack } from "model/selectors/getDialogStack";
import React, { useEffect } from "react";
import { IOpenedScreen } from "../../../model/entities/types/IOpenedScreen";
import { getWorkbenchLifecycle } from "../../../model/selectors/getWorkbenchLifecycle";
import S from "./ScreenArea.module.scss";
import { DialogScreenBuilder } from "./ScreenBuilder";
import { CtxPanelVisibility } from "gui/contexts/GUIContexts";
import { onWorkflowAbortClick } from "../../../model/actions-ui/ScreenHeader/onWorkflowAbortClick";
import { onWorkflowNextClick } from "../../../model/actions-ui/ScreenHeader/onWorkflowNextClick";
import { T } from "../../../utils/translation";
import { IActionPlacement } from "model/entities/types/IAction";
import cx from "classnames";

export const DialogScreen: React.FC<{
  openedScreen: IOpenedScreen;
}> = observer((props) => {
  const key = `ScreenDialog@${props.openedScreen.menuItemId}@${props.openedScreen.order}`;
  const workbenchLifecycle = getWorkbenchLifecycle(props.openedScreen);

  function renderActionButtons() {
    const content = props.openedScreen.content;
    const isNextButton = content.formScreen && content.formScreen.showWorkflowNextButton;
    const isCancelButton = content.formScreen && content.formScreen.showWorkflowCancelButton;
    return (
      <div className={S.actionButtonHeader}>
        {isCancelButton && (
          <button
            className={S.workflowActionBtn}
            onClick={onWorkflowAbortClick(content.formScreen!)}
          >
            {T("Cancel", "button_cancel")}
          </button>
        )}
        {isNextButton && (
          <button
            className={S.workflowActionBtn}
            onClick={onWorkflowNextClick(content.formScreen!)}
          >
            {T("Next", "button_next")}
          </button>
        )}
      </div>
    );
  }

  useEffect(() => {
    getDialogStack(workbenchLifecycle).pushDialog(
      key,
      <Observer>
        {() => (
          <ModalWindow
            title={
              /*!props.openedScreen.content.isLoading
                ? props.openedScreen.content.formScreen!.title
                : */ props
                .openedScreen.tabTitle
            }
            titleIsWorking={
              props.openedScreen.content.isLoading ||
              getIsScreenOrAnyDataViewWorking(props.openedScreen.content.formScreen!) ||
              !!window.localStorage.getItem("debugKeepProgressIndicatorsOn")
            }
            titleButtons={
              <CloseButton onClick={(event) => onScreenTabCloseClick(props.openedScreen)(event)} />
            }
            buttonsCenter={null}
            buttonsLeft={null}
            buttonsRight={
              <Observer>
                {() =>
                  !props.openedScreen.content.isLoading ? (
                    <>
                      {props.openedScreen.content
                        .formScreen!.dialogActions.filter(
                          (action) =>
                            action.placement !== IActionPlacement.PanelHeader &&
                            action.placement !== IActionPlacement.PanelMenu
                        )
                        .map((action, idx) => (
                          <button
                            className={cx({ isPrimary: action.isDefault })}
                            tabIndex={0}
                            key={action.id}
                            onClick={(event: any) => {
                              onSelectionDialogActionButtonClick(action)(event, action);
                            }}
                          >
                            {action.caption}
                          </button>
                        ))}
                    </>
                  ) : (
                    <></>
                  )
                }
              </Observer>
            }
          >
            <Observer>
              {() => (
                <div
                  style={{
                    width: props.openedScreen.dialogInfo!.width,
                    height: props.openedScreen.dialogInfo!.height,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {
                    !props.openedScreen.content.isLoading ? (
                      <CtxPanelVisibility.Provider value={{ isVisible: true }}>
                        {renderActionButtons()}
                        <DialogScreenBuilder openedScreen={props.openedScreen} />
                      </CtxPanelVisibility.Provider>
                    ) : null /*<DialogLoadingContent />*/
                  }
                </div>
              )}
            </Observer>
          </ModalWindow>
        )}
      </Observer>
    );
    return () => getDialogStack(workbenchLifecycle).closeDialog(key);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
});
