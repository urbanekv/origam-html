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

import React, { RefObject } from "react";
import { MainMenuUL } from "gui/Components/MainMenu/MainMenuUL";
import { MainMenuLI } from "gui/Components/MainMenu/MainMenuLI";
import { MainMenuItem } from "gui/Components/MainMenu/MainMenuItem";
import { Icon } from "gui/Components/Icon/Icon";
import { MobXProviderContext, observer } from "mobx-react";
import { IApplication } from "model/entities/types/IApplication";
import { getIsMainMenuLoading } from "model/selectors/MainMenu/getIsMainMenuLoading";
import { getMainMenu } from "model/selectors/MainMenu/getMainMenu";
import { action} from "mobx";
import { IWorkbench } from "model/entities/types/IWorkbench";
import { onMainMenuItemClick } from "model/actions-ui/MainMenu/onMainMenuItemClick";
import { getActiveScreen } from "model/selectors/getActiveScreen";
import { Dropdowner } from "gui/Components/Dropdowner/Dropdowner";
import { Dropdown } from "gui/Components/Dropdown/Dropdown";
import { DropdownItem } from "gui/Components/Dropdown/DropdownItem";
import { T } from "utils/translation";
import { getFavorites } from "model/selectors/MainMenu/getFavorites";
import { runInFlowWithHandler } from "utils/runInFlowWithHandler";
import { getDialogStack } from "model/selectors/getDialogStack";
import { ChooseFavoriteFolderDialog } from "gui/Components/Dialogs/ChooseFavoriteFolderDialog";
import { getIconUrl } from "gui/getIconUrl";
import { getMainMenuState } from "model/selectors/MainMenu/getMainMenuState";
import { getCustomAssetsRoute } from "model/selectors/User/getCustomAssetsRoute";
import { IMenuItemIcon } from "gui/Workbench/MainMenu/IMenuItemIcon";
import {onResetColumnConfigClick} from "../../model/actions-ui/MainMenu/onResetColumnConfigClick";

@observer
export class CMainMenu extends React.Component {
  static contextType = MobXProviderContext;

  get application(): IApplication {
    return this.context.application;
  }

  render() {
    const { application } = this;
    const isLoading = getIsMainMenuLoading(application);
    const mainMenu = getMainMenu(application);

    if (isLoading || !mainMenu) {
      return null; // TODO: More intelligent menu loading indicator...
    }
    return <>{listFromNode(mainMenu.menuUI, 1, true)}</>;
  }
}

export function itemForNode(node: any, level: number, isOpen: boolean) {
  switch (node.name) {
    case "Submenu":
      return (
        <MainMenuLI key={node.$iid}>
          <CMainMenuFolderItem node={node} level={level} isOpen={isOpen} />
        </MainMenuLI>
      );
    case "Command":
      return (
        <MainMenuLI key={node.$iid}>
          <CMainMenuCommandItem node={node} level={level} isOpen={isOpen} />
        </MainMenuLI>
      );
    default:
      return null;
  }
}

function listFromNode(node: any, level: number, isOpen: boolean) {
  return (
    <MainMenuUL>
      {node.elements
        .filter((childNode: any) => childNode.attributes.isHidden !== "true")
        .map((node: any) => itemForNode(node, level, isOpen))}
    </MainMenuUL>
  );
}

@observer
class CMainMenuCommandItem extends React.Component<{
  node: any;
  level: number;
  isOpen: boolean;
}> {
  static contextType = MobXProviderContext;

  get workbench(): IWorkbench {
    return this.context.workbench;
  }

  get menuId() {
    return this.props.node.attributes["id"];
  }

  get favorites() {
    return getFavorites(this.workbench);
  }

  onRemoveFromFavoritesClicked() {
    runInFlowWithHandler({
      ctx: this.workbench,
      action: () => this.favorites.remove(this.menuId),
    });
  }

  render() {
    const { props } = this;
    const customAssetsRoute = getCustomAssetsRoute(this.workbench);
    const activeScreen = getActiveScreen(this.workbench);
    const activeMenuItemId = activeScreen ? activeScreen.menuItemId : undefined;
    return (
      <Dropdowner
        trigger={({ refTrigger, setDropped }) => (
          <MainMenuItem
            refDom={refTrigger}
            level={props.level}
            isActive={false}
            id={"menu_"+props.node.attributes.id}
            icon={
              <Icon
                src={getIconUrl(
                  props.node.attributes.icon,
                  customAssetsRoute + "/" + props.node.attributes.icon
                )}
                tooltip={props.node.attributes.label}
              />
            }
            label={props.node.attributes.label}
            isHidden={!props.isOpen}
            // TODO: Implements selector for this idset
            isOpenedScreen={this.workbench.openedScreenIdSet.has(props.node.attributes.id)}
            isActiveScreen={activeMenuItemId === props.node.attributes.id}
            onClick={(event) =>
              onMainMenuItemClick(this.workbench)({
                event,
                item: props.node,
                idParameter: undefined,
              })
            }
            onContextMenu={(event) => {
              setDropped(true, event);
              event.preventDefault();
              event.stopPropagation();
            }}
          />
        )}
        content={({ setDropped }) => (
          <Dropdown>
            <DropdownItem
              onClick={(event: any) => {
                setDropped(false);
                onMainMenuItemClick(this.workbench)({
                  event,
                  item: props.node,
                  idParameter: undefined,
                })
              }}
            >
              {T("Open", "open_form")}
            </DropdownItem>
            <DropdownItem
              onClick={(event: any) => {
                setDropped(false);
                onMainMenuItemClick(this.workbench)({
                  event,
                  item: props.node,
                  idParameter: undefined,
                  forceOpenNew: true
                })
              }}
            >
              {T("Open in New Tab", "open_in_new_tab")}
            </DropdownItem>
            {(props.node.attributes.type === "FormReferenceMenuItem" ||
             props.node.attributes.type === "FormReferenceMenuItem_WithSelection") &&
              <DropdownItem
                onClick={(event: any) => {
                  setDropped(false);
                    onResetColumnConfigClick(this.workbench)({
                      item: props.node
                  })
                }}
              >
                {T("Reset Column Configuration", "reset_column_configuration")}
              </DropdownItem>
            }
            {!this.favorites.isInAnyFavoriteFolder(this.menuId) && (
              <DropdownItem
                onClick={(event: any) => {
                  setDropped(false);
                  onAddToFavoritesClicked(this.workbench, this.menuId);
                }}
              >
                {T("Put to favourites", "put_to_favourites")}
              </DropdownItem>
            )}
            {this.favorites.isInAnyFavoriteFolder(this.menuId) && (
              <DropdownItem
                onClick={(event: any) => {
                  setDropped(false);
                  this.onRemoveFromFavoritesClicked();
                }}
              >
                {T("Remove from Favourites", "remove_from_favourites")}
              </DropdownItem>
            )}
          </Dropdown>
        )}
      />
    );
  }
}

export function onAddToFavoritesClicked(ctx: any, menuId: string) {
  const favorites = getFavorites(ctx);
  const closeDialog = getDialogStack(ctx).pushDialog(
    "",
    <ChooseFavoriteFolderDialog
      onOkClick={(folderId: string) => {
        runInFlowWithHandler({
          ctx: ctx,
          action: () => favorites.add(folderId, menuId),
        });
        closeDialog();
      }}
      onCancelClick={() => closeDialog()}
      favorites={favorites.favoriteFolders}
    />
  );
}

@observer
class CMainMenuFolderItem extends React.Component<{
  node: any;
  level: number;
  isOpen: boolean;
}> {
  static contextType = MobXProviderContext;
  itemRef: RefObject<HTMLDivElement> = React.createRef();

  componentDidMount() {
    this.mainMenuState.setReference(this.id, this.itemRef);
  }

  get id() {
    return this.props.node.attributes.id;
  }

  get mainMenuState() {
    return getMainMenuState(this.context.application);
  }

  @action.bound handleClick(event: any) {
    this.mainMenuState.flipIsOpen(this.id);
  }

  get icon() {
    if(this.props.node.attributes.icon !== IMenuItemIcon.Folder){
      const customAssetsRoute = getCustomAssetsRoute(this.context.application);
      return <Icon src={customAssetsRoute + "/" + this.props.node.attributes.icon} tooltip={this.props.node.attributes.label} />;
    }
    if (this.mainMenuState.isOpen(this.id)) {
      return <Icon src="./icons/folder-open.svg" tooltip={this.props.node.attributes.label} />;
    } else {
      return <Icon src="./icons/folder-closed.svg" tooltip={this.props.node.attributes.label} />;
    }
  }

  render() {
    const { props } = this;
    return (
      <div ref={this.itemRef}>
        <MainMenuItem
          level={props.level}
          isActive={false}
          icon={this.icon}
          id={"menu_"+props.node.attributes.id}
          label={props.node.attributes.label}
          isHidden={!props.isOpen}
          onClick={this.handleClick}
          isHighLighted={this.id === this.mainMenuState.highLightedItemId}
        />
        {listFromNode(
          props.node,
          props.level + 1,
          this.props.isOpen && this.mainMenuState.isOpen(this.id)
        )}
      </div>
    );
  }
}
