import {IDialogInfo, IOpenedScreen} from "./IOpenedScreen";
import {IMainMenuItemType} from "./IMainMenu";
import {IUserInfo} from "model/entities/types/IUserInfo";

export interface IWorkbenchLifecycle {
  $type_IWorkbenchLifecycle: 1;

  onMainMenuItemClick(args: { event: any; item: any }): Generator;
  onWorkQueueListItemClick(event: any, item: any): Generator;
  onScreenTabHandleClick(event: any, openedScreen: IOpenedScreen): Generator;
  notificationBox: any;
  userInfo: IUserInfo | undefined;
  logoUrl: string | undefined;
  customAssetsRoute: string | undefined;
  openNewForm(
    id: string,
    type: IMainMenuItemType,
    label: string,
    dontRequestData: boolean,
    dialogInfo: IDialogInfo | undefined,
    parameters: { [key: string]: any },
    parentContext: any,
    additionalRequestParameters?: object | undefined,
  ): Generator;

  openNewUrl(url: string, title: string): Generator;

  closeForm(openedScreen: IOpenedScreen): Generator;

  run(): Generator;
  parent?: any;
}

export const isIWorkbenchLifecycle = (o: any): o is IWorkbenchLifecycle =>
  o.$type_IWorkbenchLifecycle;
