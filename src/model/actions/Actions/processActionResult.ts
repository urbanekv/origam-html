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

import {IActionResultType} from "../SelectionDialog/types";
import {getWorkbenchLifecycle} from "../../selectors/getWorkbenchLifecycle";
import {DialogInfo} from "model/entities/OpenedScreen";
import {closeForm} from "../closeForm";
import {getActionCaption} from "model/selectors/Actions/getActionCaption";
import {IMainMenuItemType} from "model/entities/types/IMainMenu";
import {IDialogInfo} from "model/entities/types/IOpenedScreen";

import actions from "model/actions-tree";
import {IUrlUpenMethod} from "model/entities/types/IUrlOpenMethod";
import {openNewUrl} from "../Workbench/openNewUrl";
import {ICRUDResult, processCRUDResult} from "../DataLoading/processCRUDResult";
import {IRefreshOnReturnType} from "model/entities/WorkbenchLifecycle/WorkbenchLifecycle";
import {IDataView} from "../../entities/types/IDataView";
import {getDataViewByModelInstanceId} from "../../selectors/DataView/getDataViewByModelInstanceId";
import {getOpenedScreen} from "../../selectors/getOpenedScreen";
import { getMainMenuItemById } from "model/selectors/MainMenu/getMainMenuItemById";

export interface IOpenNewForm {
  (
    id: string,
    type: IMainMenuItemType,
    label: string,
    isLazyLoading: boolean,
    dialogInfo: IDialogInfo | undefined,
    parameters: { [key: string]: any },
    parentContext: any,
    requestParameters: object,
    formSessionId?: string,
    isSessionRebirth?: boolean,
    registerSession?: true,
    refreshOnReturnType?: IRefreshOnReturnType
  ): Generator; //boolean
}

export interface IOpenNewUrl {
  (url: string, urlOpenMethod: IUrlUpenMethod, title: string): Generator;
}

export interface IGetActionCaption {
  (): string;
}

export interface ICloseForm {
  (): Generator;
}

export interface IRefreshForm {
  (): Generator;
}

export interface IProcessCRUDResult {
  (data:{crudResult: ICRUDResult, resortTables?: boolean}): Generator;
}

export function new_ProcessActionResult(ctx: any) {
  const workbenchLifecycle = getWorkbenchLifecycle(ctx);
  const getPanelFunc = (modelInstanceId: string) => getDataViewByModelInstanceId(ctx, modelInstanceId)!;
  return processActionResult2({
    getPanelFunc: getPanelFunc,
    openNewForm: workbenchLifecycle.openNewForm,
    openNewUrl: openNewUrl(ctx),
    closeForm: closeForm(ctx),
    refreshForm: actions.formScreen.refresh(ctx),
    getActionCaption: () => getActionCaption(ctx),
    processCRUDResult: (data:{crudResult: ICRUDResult, resortTables?: boolean}) => processCRUDResult(ctx, data.crudResult, data.resortTables),
    parentContext: ctx
  });
}

export function processActionResult2(dep: {
  getPanelFunc: (modelInstanceId: string) => IDataView;
  openNewForm: IOpenNewForm;
  openNewUrl: IOpenNewUrl;
  closeForm: ICloseForm;
  refreshForm: IRefreshForm;
  getActionCaption: IGetActionCaption;
  processCRUDResult: IProcessCRUDResult;
  parentContext: any
}) {
  return function* processActionResult2(actionResultList: any[]) {
    const indexedList = actionResultList.map((item, index) => [index, item]);
    indexedList.sort((a: any, b: any) => {
      if(a[1].type === IActionResultType.DestroyForm) return -1;
      if(b[1].type === IActionResultType.DestroyForm) return 1;
      return a[0] - b[0]
    })
    for (let actionResultItem of indexedList.map(item => item[1])) {
      switch (actionResultItem.type) {
        case IActionResultType.OpenForm: {
          const menuItem = getMainMenuItemById(dep.parentContext, actionResultItem.request.objectId);
          const lazyLoading = menuItem 
            ? menuItem?.attributes?.lazyLoading === "true" 
            : false;
          const { request, refreshOnReturnType } = actionResultItem;
          const {
            objectId,
            typeString,
            parameters,
            isModalDialog,
            dialogWidth,
            dialogHeight,
            caption
          } = request;
          const dialogInfo = isModalDialog ? new DialogInfo(dialogWidth, dialogHeight) : undefined;
          yield* dep.openNewForm(
            objectId,
            typeString,
            caption || dep.getActionCaption(),
            lazyLoading,
            dialogInfo,
            parameters,
            dep.parentContext,
            actionResultItem.request,
            undefined,
            undefined,
            undefined,
            refreshOnReturnType,
          );
          break;
        }
        case IActionResultType.DestroyForm: {
          yield* dep.closeForm();
          break;
        }
        case IActionResultType.RefreshData: {
          yield* dep.refreshForm();
          break;
        }
        case IActionResultType.UpdateData: {
          yield* dep.processCRUDResult(
            {crudResult: actionResultItem.changes,  resortTables: true}
          );
          break;
        }
        case IActionResultType.OpenUrl: {
          yield* dep.openNewUrl(
            actionResultItem.url,
            actionResultItem.urlOpenMethod,
            actionResultItem.request.caption
          );
          if(getOpenedScreen(dep.parentContext).isDialog){
            yield* dep.closeForm();
          }
          break;
        }
        case IActionResultType.Script: {
          try {
            // eslint-disable-next-line no-new-func
            const actionScript = new Function("getPanel", actionResultItem.script);
            actionScript(dep.getPanelFunc);
          }catch (e) {
            let message = "An error occurred while executing custom script: "+actionResultItem.script+", \n"+e.message;
            if(e.stackTrace)
              message +=(", \n"+e.stackTrace);
            throw new Error(message)
          }
          break;
        }
      }
    }
  };
}
