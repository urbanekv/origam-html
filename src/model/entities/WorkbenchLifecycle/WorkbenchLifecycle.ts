import bind from "bind-decorator";
import { reloadScreen } from "model/actions/FormScreen/reloadScreen";
import { handleError } from "model/actions/handleError";
import { createFormScreenEnvelope } from "model/factories/createFormScreenEnvelope";
import { createOpenedScreen } from "model/factories/createOpenedScreen";
import { getIsFormScreenDirty } from "model/selectors/FormScreen/getisFormScreenDirty";
import { getApi } from "model/selectors/getApi";
import { getClientFulltextSearch } from "model/selectors/getClientFulltextSearch";
import { getOpenedScreens } from "model/selectors/getOpenedScreens";
import { getMainMenuEnvelope } from "model/selectors/MainMenu/getMainMenuEnvelope";
import { getMainMenuItemById } from "model/selectors/MainMenu/getMainMenuItemById";
import { getWorkQueues } from "model/selectors/WorkQueues/getWorkQueues";
import { findMenu } from "xmlInterpreters/menuXml";
import { MainMenuContent } from "../MainMenu";
import { DialogInfo } from "../OpenedScreen";
import { IMainMenuItemType } from "../types/IMainMenu";
import { IDialogInfo, IOpenedScreen } from "../types/IOpenedScreen";
import { IWorkbenchLifecycle } from "../types/IWorkbenchLifecycle";
import { WebScreen } from "../WebScreen";
import { getSessionId } from "model/selectors/getSessionId";
import { scopeFor } from "dic/Container";
import { assignIIds } from "xmlInterpreters/xmlUtils";
import { DEBUG_CLOSE_ALL_FORMS } from "utils/debugHelpers";
import { getOpenedScreen } from "../../selectors/getOpenedScreen";
import { onWorkflowNextClick } from "model/actions-ui/ScreenHeader/onWorkflowNextClick";
import { observable, when } from "mobx";
import { IUserInfo } from "model/entities/types/IUserInfo";
import { getChatrooms } from "model/selectors/Chatrooms/getChatrooms";
import { openNewUrl } from "model/actions/Workbench/openNewUrl";
import { IUrlUpenMethod } from "../types/IUrlOpenMethod";
import { IPortalSettings } from "../types/IPortalSettings";
import { getNotifications } from "model/selectors/Chatrooms/getNotifications";
import selectors from "model/selectors-tree";
import { onMainMenuItemClick } from "model/actions-ui/MainMenu/onMainMenuItemClick";
import { getFavorites } from "model/selectors/MainMenu/getFavorites";
import produce from "immer";

export enum IRefreshOnReturnType {
  None = "None",
  ReloadActualRecord = "ReloadActualRecord",
  RefreshCompleteForm = "RefreshCompleteForm",
  MergeModalDialogChanges = "MergeModalDialogChanges",
}

export class WorkbenchLifecycle implements IWorkbenchLifecycle {
  $type_IWorkbenchLifecycle: 1 = 1;

  @observable
  portalSettings: IPortalSettings | undefined;
  @observable
  userInfo: IUserInfo | undefined;
  @observable
  logoUrl: string | undefined;
  @observable
  customAssetsRoute: string | undefined;

  *onMainMenuItemClick(args: {
    event: any;
    item: any;
    idParameter: string | undefined;
    isSingleRecordEdit?: boolean;
  }): Generator {
    const {
      type,
      id,
      label,
      dialogWidth,
      dialogHeight,
      lazyLoading,
      urlOpenMethod,
    } = args.item.attributes;
    const { event } = args;
    const alwaysOpenNew = args.item.attributes.alwaysOpenNew === "true";

    if (urlOpenMethod === "LaunchBrowserWindow") {
      const url = (yield this.getReportTabUrl(id)) as string;
      window.open(url);
      return;
    }

    const openedScreens = getOpenedScreens(this);

    let dialogInfo: IDialogInfo | undefined;
    if (type === IMainMenuItemType.FormRefWithSelection) {
      dialogInfo = new DialogInfo(parseInt(dialogWidth, 10), parseInt(dialogHeight, 10));
    }
    if (event && !event.ctrlKey) {
      const existingItem = openedScreens.findLastExistingItem(id);
      if (
        existingItem &&
        type !== IMainMenuItemType.FormRefWithSelection &&
        type !== IMainMenuItemType.ReportReferenceMenuItem &&
        !alwaysOpenNew
      ) {
        openedScreens.activateItem(id, existingItem.order);
        const openedScreen = existingItem;
        if (openedScreen.isSleeping) {
          openedScreen.isSleeping = false;
          const initUIResult = yield* this.initUIForScreen(
            openedScreen,
            false,
            undefined,
            args.isSingleRecordEdit
          );
          yield* openedScreen.content!.start(initUIResult, openedScreen.isSleepingDirty);
        } else if (
          openedScreen.content &&
          openedScreen.content.formScreen &&
          openedScreen.content.formScreen.refreshOnFocus &&
          !openedScreen.content.isLoading
        ) {
          if (!getIsFormScreenDirty(openedScreen.content.formScreen)) {
            yield* reloadScreen(openedScreen.content.formScreen)();
          }
        }
      } else {
        if (type === IMainMenuItemType.ReportReferenceMenuItem) {
          const url = (yield this.getReportTabUrl(id)) as string;
          yield* this.openNewUrl(url, "");
          return;
        } else {
          yield* this.openNewForm(
            id,
            type,
            label,
            lazyLoading === "true",
            dialogInfo,
            args.idParameter ? { id: args.idParameter } : {},
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            args.isSingleRecordEdit
          );
        }
      }
    } else {
      yield* this.openNewForm(
        id,
        type,
        label,
        lazyLoading === "true",
        dialogInfo,
        args.idParameter ? { id: args.idParameter } : {},
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        args.isSingleRecordEdit
      );
    }
  }

  *onMainMenuItemIdClick(args: {
    event: any;
    itemId: any;
    idParameter: string | undefined;
    isSingleRecordEdit?: boolean;
  }) {
    let menuItem = args.itemId && selectors.mainMenu.getItemById(this, args.itemId);
    if (args.isSingleRecordEdit) {
      // Temporary hack o allow filtered screens to work unless single record edit is
      // implemented for paginated screens on server side. There is no need to paginate
      // when we have just one record, hence it is ok to execute the screen in without
      // pagination
      menuItem = produce(menuItem, (draft: any) => {
        draft.attributes.isLazyLoading = "false";
      });
    }
    if (menuItem) {
      yield onMainMenuItemClick(this)({
        event: undefined,
        item: menuItem,
        idParameter: args.idParameter,
        isSingleRecordEdit: args.isSingleRecordEdit,
      });
    }
    // debugger;
    // yield * this.onMainMenuItemClick({event: args.event, item: menuItem});
  }

  async getReportTabUrl(menuId: string) {
    const api = getApi(this);
    const url = await api.getReportFromMenu({ menuId: menuId });
    return url;
  }

  *onWorkQueueListItemClick(event: any, item: any) {
    const openedScreens = getOpenedScreens(this);

    const id = item.id;
    const type = IMainMenuItemType.WorkQueue;
    const label = item.name;

    let dialogInfo: IDialogInfo | undefined;
    if (!event.ctrlKey) {
      const existingItem = openedScreens.findLastExistingItem(id);
      if (existingItem) {
        openedScreens.activateItem(id, existingItem.order);
        const openedScreen = existingItem;
        if (openedScreen.isSleeping) {
          openedScreen.isSleeping = false;
          const initUIResult = yield* this.initUIForScreen(openedScreen, false, undefined);
          yield* openedScreen.content!.start(initUIResult, openedScreen.isSleepingDirty);
        } else if (
          openedScreen.content &&
          openedScreen.content.formScreen &&
          openedScreen.content.formScreen.refreshOnFocus &&
          !openedScreen.content.isLoading
        ) {
          if (!getIsFormScreenDirty(openedScreen.content.formScreen)) {
            yield* reloadScreen(openedScreen.content.formScreen)();
          }
        }
      } else {
        yield* this.openNewForm(id, type, label, false, dialogInfo, {});
      }
    } else {
      yield* this.openNewForm(id, type, label, false, dialogInfo, {});
    }
  }

  *onChatroomsListItemClick(event: any, item: any) {

    const openedScreens = getOpenedScreens(this);
    const url = `/chatrooms/index.html#/chatroom?chatroomId=${item.id}`;
    const id = url;

    let dialogInfo: IDialogInfo | undefined;

    const existingItem = openedScreens.findLastExistingItem(id);
    if (existingItem) {
      openedScreens.activateItem(id, existingItem.order);
      const openedScreen = existingItem;
      if (openedScreen.isSleeping) {
        openedScreen.isSleeping = false;
        const initUIResult = yield* this.initUIForScreen(openedScreen, false);
        yield* openedScreen.content!.start(initUIResult, openedScreen.isSleepingDirty);
      } else if (
        openedScreen.content &&
        openedScreen.content.formScreen &&
        openedScreen.content.formScreen.refreshOnFocus &&
        !openedScreen.content.isLoading
      ) {
        if (!getIsFormScreenDirty(openedScreen.content.formScreen)) {
          yield* reloadScreen(openedScreen.content.formScreen)();
        }
      }
    } else {
      yield* openNewUrl(this)(url, IUrlUpenMethod.OrigamTab, item.topic);
    }
  }

  *onScreenTabHandleClick(event: any, openedScreen: IOpenedScreen): Generator {
    const openedScreens = getOpenedScreens(this);
    openedScreens.activateItem(openedScreen.menuItemId, openedScreen.order);

    if (openedScreen.isSleeping) {
      openedScreen.isSleeping = false;
      const initUIResult = yield* this.initUIForScreen(openedScreen, false);
      yield* openedScreen.content!.start(initUIResult, openedScreen.isSleepingDirty);
    } else if (
      openedScreen.content &&
      openedScreen.content.formScreen &&
      openedScreen.content.formScreen.refreshOnFocus &&
      !openedScreen.content.isLoading
    ) {
      if (!getIsFormScreenDirty(openedScreen.content.formScreen)) {
        yield* reloadScreen(openedScreen.content.formScreen)();
      }
    }
  }

  *closeForm(openedScreen: IOpenedScreen): Generator {
    // TODO: Refactor to get rid of code duplication
    const openedScreens = getOpenedScreens(openedScreen);

    const parentScreen = openedScreen.parentContext
      ? getOpenedScreen(openedScreen.parentContext)
      : undefined;

    const screenToActivate = parentScreen && !parentScreen.isClosed
      ? parentScreen
      : openedScreens.findClosestItem(openedScreen.menuItemId, openedScreen.order);

    openedScreens.deleteItem(openedScreen.menuItemId, openedScreen.order);
    if (openedScreen.dialogInfo) {
      if (openedScreen.isActive) {
        if (screenToActivate) {
          openedScreens.activateItem(screenToActivate.menuItemId, screenToActivate.order);

          if (screenToActivate.isSleeping) {
            screenToActivate.isSleeping = false;
            const initUIResult = yield* this.initUIForScreen(screenToActivate, false);
            yield* screenToActivate.content!.start(initUIResult, screenToActivate.isSleepingDirty);
          } else if (
            screenToActivate.content &&
            screenToActivate.content.formScreen &&
            (screenToActivate.content.formScreen.refreshOnFocus ||
              openedScreen.content.refreshOnReturnType ===
                IRefreshOnReturnType.RefreshCompleteForm) &&
            !screenToActivate.content.isLoading
          ) {
            if (!getIsFormScreenDirty(screenToActivate.content.formScreen)) {
              yield* reloadScreen(screenToActivate.content.formScreen)();
            }
          }
        }
      }
    } else {
      if (openedScreen.isActive) {
        if (screenToActivate) {
          openedScreens.activateItem(screenToActivate.menuItemId, screenToActivate.order);

          if (screenToActivate.isSleeping) {
            screenToActivate.isSleeping = false;
            const initUIResult = yield* this.initUIForScreen(screenToActivate, false);
            yield* screenToActivate.content!.start(initUIResult, screenToActivate.isSleepingDirty);
          } else if (
            screenToActivate.content &&
            screenToActivate.content.formScreen &&
            screenToActivate.content.formScreen.refreshOnFocus &&
            !screenToActivate.content.isLoading
          ) {
            if (!getIsFormScreenDirty(screenToActivate.content.formScreen)) {
              yield* reloadScreen(screenToActivate.content.formScreen)();
            }
          }
        }
      }
    }

    yield* this.destroyUI(openedScreen);

    if (openedScreen.content && openedScreen.content.formScreen) {
      const scope = scopeFor(openedScreen.content.formScreen);
      if (scope) scope.disposeWithChildren();
    }
    openedScreen.isClosed = true;
  }

  *destroyUI(openedScreen: IOpenedScreen) {
    const api = getApi(this);
    if (openedScreen.content) {
      if (openedScreen.content.formScreen) {
        yield api.destroyUI({ FormSessionId: getSessionId(openedScreen.content.formScreen) });
      } else if (openedScreen.content.preloadedSessionId) {
        yield api.destroyUI({ FormSessionId: openedScreen.content.preloadedSessionId });
      }
    }
  }

  @bind
  *openNewForm(
    id: string,
    type: IMainMenuItemType,
    label: string,
    isLazyLoading: boolean,
    dialogInfo: IDialogInfo | undefined,
    parameters: { [key: string]: any },
    parentContext?: any,
    additionalRequestParameters?: object | undefined,
    formSessionId?: string,
    isSessionRebirth?: boolean,
    isSleepingDirty?: boolean,
    refreshOnReturnType?: IRefreshOnReturnType,
    isSingleRecordEdit?: boolean
  ) {
    const openedScreens = getOpenedScreens(this);
    const existingItem = openedScreens.findLastExistingItem(id);
    const newFormScreen = createFormScreenEnvelope(formSessionId, refreshOnReturnType);
    const newScreen = yield* createOpenedScreen(
      this,
      id,
      type,
      existingItem ? existingItem.order + 1 : 0,
      label,
      newFormScreen,
      isLazyLoading,
      dialogInfo,
      parameters,
      isSessionRebirth,
      isSleepingDirty
    );
    try {
      openedScreens.pushItem(newScreen);
      if (!isSessionRebirth) {
        newScreen.parentContext = parentContext;
        openedScreens.activateItem(newScreen.menuItemId, newScreen.order);
      }

      if (isSessionRebirth) {
        return;
      }

      const initUIResult = yield* this.initUIForScreen(
        newScreen,
        !isSessionRebirth,
        additionalRequestParameters,
        isSingleRecordEdit
      );

      yield* newFormScreen.start(initUIResult);
      const formScreen = newScreen.content.formScreen;
      if (formScreen?.autoWorkflowNext) {
        yield onWorkflowNextClick(formScreen!)(undefined);
      }
    } catch (e) {
      yield* handleError(this)(e);
      yield* this.closeForm(newScreen);
      throw e;
    }
  }

  *initUIForScreen(
    screen: IOpenedScreen,
    isNewSession: boolean,
    additionalRequestParameters?: object | undefined,
    isSingleRecordEdit?: boolean
  ) {
    const api = getApi(this);
    const initUIResult = yield api.initUI({
      Type: screen.menuItemType,
      Caption: screen.title,
      ObjectId: screen.menuItemId,
      FormSessionId: screen.content!.preloadedSessionId,
      IsNewSession: isNewSession,
      RegisterSession: true, //!!registerSession,
      DataRequested: !screen.lazyLoading,
      Parameters: screen.parameters,
      AdditionalRequestParameters: additionalRequestParameters,
      IsSingleRecordEdit: isSingleRecordEdit,
      RequestCurrentRecordId: true
    });
    return initUIResult;
  }

  *openNewUrl(url: string, title: string) {
    const openedScreens = getOpenedScreens(this);
    const newScreen = new WebScreen(title, url, url, 0);
    openedScreens.pushItem(newScreen);
    openedScreens.activateItem(newScreen.menuItemId, newScreen.order);
  }

  *initPortal() {
    const api = getApi(this);
    const portalInfo = yield api.initPortal();

    document.title = portalInfo.title;
    this.userInfo = {
      userName: portalInfo.userName,
      avatarLink: portalInfo.avatarLink,
    };
    this.logoUrl = portalInfo.logoUrl;
    this.customAssetsRoute = portalInfo.customAssetsRoute;
    this.portalSettings = {
      showChat: portalInfo.chatRefreshInterval > 0,
      showWorkQueues: portalInfo.workQueueListRefreshInterval > 0,
    };
    const menuUI = findMenu(portalInfo.menu);
    assignIIds(menuUI);
    getFavorites(this).setXml(portalInfo.favorites);
    getMainMenuEnvelope(this).setMainMenu(new MainMenuContent({ menuUI }));
    getClientFulltextSearch(this).indexMainMenu(menuUI);

    if (!DEBUG_CLOSE_ALL_FORMS()) {
      for (let session of portalInfo.sessions) {
        const menuItem = getMainMenuItemById(this, session.objectId);
        const lazyLoading = menuItem 
          ? menuItem?.attributes?.lazyLoading === "true" 
          : false;
        yield* this.openNewForm(
          session.objectId,
          session.type,
          session.caption, // TODO: Find in menu
          lazyLoading,
          undefined, // TODO: Find in... menu?
          {},
          undefined,
          undefined,
          session.formSessionId,
          true,
          session.isDirty
        );
      }
    } else {
      for (let session of portalInfo.sessions) {
        yield api.destroyUI({ FormSessionId: session.formSessionId });
      }
    }

    const openedScreens = getOpenedScreens(this);
    if (openedScreens.items.length > 0) {
      openedScreens.activateItem(openedScreens.items[0].menuItemId, openedScreens.items[0].order);
      openedScreens.items[0].isSleeping = false;
      const initUIResult = yield* this.initUIForScreen(openedScreens.items[0], false);
      if (openedScreens.items[0].content) {
        yield* openedScreens.items[0].content.start(
          initUIResult,
          openedScreens.items[0].isSleepingDirty
        );
      }
    }

    if (this.portalSettings?.showWorkQueues) {
      yield* getWorkQueues(this).startTimer(portalInfo.workQueueListRefreshInterval);
    }

    if (this.portalSettings?.showChat) {
      yield* getChatrooms(this).startTimer(portalInfo.chatRefreshInterval);
    }

    if (portalInfo.notificationBoxRefreshInterval > 0) {
      yield* getNotifications(this).startTimer(portalInfo.notificationBoxRefreshInterval);
    }
  }

  *run(): Generator {
    yield* this.initPortal();
  }

  parent?: any;
}
