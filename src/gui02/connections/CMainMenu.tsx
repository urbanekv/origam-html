import React from "react";
import { MainMenuUL } from "gui02/components/MainMenu/MainMenuUL";
import { MainMenuLI } from "gui02/components/MainMenu/MainMenuLI";
import { MainMenuItem } from "gui02/components/MainMenu/MainMenuItem";
import { Icon } from "gui02/components/Icon/Icon";
import { MobXProviderContext, observer } from "mobx-react";
import { IApplication } from "model/entities/types/IApplication";
import { getIsMainMenuLoading } from "model/selectors/MainMenu/getIsMainMenuLoading";
import { getMainMenu } from "model/selectors/MainMenu/getMainMenu";
import { action, observable } from "mobx";
import { IWorkbench } from "model/entities/types/IWorkbench";
import { onMainMenuItemClick } from "model/actions-ui/MainMenu/onMainMenuItemClick";
import { getActiveScreen } from "model/selectors/getActiveScreen";
import { Dropdowner } from "gui/Components/Dropdowner/Dropdowner";
import { Dropdown } from "gui02/components/Dropdown/Dropdown";
import { DropdownItem } from "gui02/components/Dropdown/DropdownItem";
import { T } from "utils/translation";
import {getFavorites} from "model/selectors/MainMenu/getFavorites";
import { runInFlowWithHandler } from "utils/runInFlowWithHandler";
import {getDialogStack} from "model/selectors/getDialogStack";
import {ChooseFavoriteFolderDialog} from "gui/Components/Dialogs/ChooseFavoriteFolderDialog";

@observer
export class CMainMenu extends React.Component {
  static contextType = MobXProviderContext;

  get application(): IApplication {
    return this.context.application;
  }

  render() {
    const { props, application } = this;
    const isLoading = getIsMainMenuLoading(application);
    const mainMenu = getMainMenu(application);

    if (isLoading || !mainMenu) {
      return null; // TODO: More intelligent menu loading indicator...
    }
    console.log(mainMenu!.menuUI);
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

function iconUrl(iconName: string) {
  switch (iconName) {
    case "menu_form.png":
      return "./icons/document.svg";
    case "menu_workflow.png":
      return "./icons/settings.svg";
    default:
      return "./icons/document.svg";
  }
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

  get menuId(){
    return this.props.node.attributes["id"];
  }

  get favorites(){
    return getFavorites(this.workbench);
  }

  onAddToFavoritesClicked(){

    const closeDialog = getDialogStack(this.workbench).pushDialog(
      "",
      <ChooseFavoriteFolderDialog
        onOkClick={(folderId: string) => {
          runInFlowWithHandler({
            ctx: this.workbench,
            action: () =>  this.favorites.add(folderId, this.menuId)
          });
          closeDialog();
        }}
        onCancelClick={() => closeDialog()}
        favorites={getFavorites(this.workbench).favoriteFolders}
      />
    );


    // runInFlowWithHandler({
    //   ctx: this.workbench,
    //   action: () => this.favorites.add("Favoriten", this.menuId)
    // });
  }

  onRemoveFromFavoritesClicked(){
    runInFlowWithHandler({
      ctx: this.workbench,
      action: () => this.favorites.remove(this.menuId)
    });
  }

  render() {
    const { props } = this;
    const activeScreen = getActiveScreen(this.workbench);
    const activeMenuItemId = activeScreen ? activeScreen.menuItemId : undefined;
    return (
      <Dropdowner
        trigger={({ refTrigger, setDropped }) => (
          <MainMenuItem
            refDom={refTrigger}
            level={props.level}
            isActive={false}
            icon={
              <Icon
                src={iconUrl(props.node.attributes.icon)}
                tooltip={props.node.attributes.label}
              />
            }
            label={
              props.node.attributes
                .label /*+ (props.node.attributes.dontRequestData === "true" ? "(DRD)" : "")*/
            }
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
              setDropped(true);
              event.preventDefault();
              event.stopPropagation();
            }}
          />
        )}
        content={({ setDropped }) => (
          <Dropdown>
            {!this.favorites.isInAnyFavoriteFolder(this.menuId) &&
              <DropdownItem
                onClick={(event: any) => {
                  setDropped(false);
                  this.onAddToFavoritesClicked();
                }}
              >
                {T("Put to favourites", "put_to_favourites")}
              </DropdownItem>
            }
            {this.favorites.isInAnyFavoriteFolder(this.menuId) &&
              <DropdownItem
                onClick={(event: any) => {
                  setDropped(false);
                  this.onRemoveFromFavoritesClicked();
                }}
              >
                {T("Remove from Favourites", "remove_from_favourites")}
              </DropdownItem>
            }
          </Dropdown>
        )}
      />
    );
  }
}

@observer
class CMainMenuFolderItem extends React.Component<{
  node: any;
  level: number;
  isOpen: boolean;
}> {
  @observable isOpen = false;

  @action.bound handleClick(event: any) {
    this.isOpen = !this.isOpen;
  }

  get icon() {
    if (this.isOpen) {
      return <Icon src="./icons/folder-open.svg" tooltip={this.props.node.attributes.label} />;
    } else {
      return <Icon src="./icons/folder-closed.svg" tooltip={this.props.node.attributes.label} />;
    }
  }

  render() {
    const { props } = this;
    return (
      <>
        <MainMenuItem
          level={props.level}
          isActive={false}
          icon={this.icon}
          label={props.node.attributes.label}
          isHidden={!props.isOpen}
          onClick={this.handleClick}
        />
        {listFromNode(props.node, props.level + 1, props.isOpen && this.isOpen)}
      </>
    );
  }
}
