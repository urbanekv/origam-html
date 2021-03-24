import { EmbeddedWebpage } from "gui/Components/EmbeddedWebpage/EmbeddedWebpage";
import { Splitter } from "gui/Components/Splitter/Splitter";
import { CScreenSectionTabbedView } from "gui/connections/CScreenSectionTabbedView";
import { action, computed, observable } from "mobx";
import { MobXProviderContext, observer, Observer } from "mobx-react";
import { onSplitterPositionChangeFinished } from "model/actions-ui/Splitter/onSplitterPositionChangeFinished";
import { IFormScreen } from "model/entities/types/IFormScreen";
import React from "react";
import SSplitter from "styles/CustomSplitter.module.scss";
import { findBoxes, findUIChildren, findUIRoot } from "../../../xmlInterpreters/screenXml";
import { Box } from "../../Components/ScreenElements/Box";
import { DataView } from "../../Components/ScreenElements/DataView";
import { Label } from "../../Components/ScreenElements/Label";
import { TabbedPanel, TabBody, TabHandle } from "../../Components/ScreenElements/TabbedPanel";
import { VBox } from "../../Components/ScreenElements/VBox";
import { WorkflowFinishedPanel } from "gui/Components/WorkflowFinishedPanel/WorkflowFinishedPanel";

import actions from "model/actions-ui-tree";
import { HBox } from "gui/Components/ScreenElements/HBox";
import { IDataView } from "model/entities/types/IDataView";
import { getDataViewById } from "model/selectors/DataView/getDataViewById";
import {serverValueToPanelSizeRatio} from "../../../model/actions-ui/Splitter/splitterPositionToServerValue";

@observer
class TabbedPanelHelper extends React.Component<{
  boxes: any[];
  nextNode: (node: any) => React.ReactNode;
}> {
  @observable activePanelId: string =
    this.props.boxes.length > 0 ? this.props.boxes[0].attributes.Id : "";

  @action.bound activateTab(tabId: string) {
    this.activePanelId = tabId;
  }

  render() {
    const { boxes, nextNode } = this.props;
    return (
      <TabbedPanel
        handles={boxes.map((box) => (
          <TabHandle
            isActive={this.activePanelId === box.attributes.Id}
            label={box.attributes.Name}
            onClick={() => this.activateTab(box.attributes.Id)}
          />
        ))}
      >
        {boxes.map((box) => (
          <Observer>
            {() => (
              <TabBody isActive={computed(() => this.activePanelId === box.attributes.Id).get()}>
                {findUIChildren(box).map((child) => nextNode(child))}
              </TabBody>
            )}
          </Observer>
        ))}
      </TabbedPanel>
    );
  }
}

@observer
export class FormScreenBuilder extends React.Component<{
  xmlWindowObject: any;
}> {
  static contextType = MobXProviderContext;

  get formScreen(): IFormScreen {
    return this.context.formScreen.formScreen;
  }

  buildScreen() {
    const self = this;
    const dataViewMap = new Map<string, IDataView>();
    function recursive(xso: any) {
      switch (xso.attributes.Type) {
        case "WorkflowFinishedPanel": {
          return (
            <WorkflowFinishedPanel
              key={xso.$iid}
              isCloseButton={xso.attributes.showWorkflowCloseButton}
              isRepeatButton={xso.attributes.showWorkflowRepeatButton}
              message={xso.attributes.Message}
              onCloseClick={actions.workflow.onCloseClick(self.formScreen)}
              onRepeatClick={actions.workflow.onRepeatClick(self.formScreen)}
            />
          );
        }
        case "HSplit": {
          const serverStoredValue = self.formScreen.getPanelPosition(xso.attributes.ModelInstanceId);
          const panelPositionRatio = serverValueToPanelSizeRatio(serverStoredValue);
          const panels = findUIChildren(xso).map((child, idx) => [
            idx,
            idx === 0 ? panelPositionRatio : 1 - panelPositionRatio,
            recursive(child),
          ]);
          return (
            <Splitter
              key={xso.$iid}
              STYLE={SSplitter}
              type="isHoriz"
              id={xso.attributes.ModelInstanceId}
              onSizeChangeFinished={(
                panelId1: any,
                panelId2: any,
                panel1SizeRatio: number,
                panel2SizeRatio: number
              ) => {
                if (panelId1 === panels[0][0]) {
                  onSplitterPositionChangeFinished(self.formScreen)(
                    xso.attributes.ModelInstanceId,
                    panel1SizeRatio
                  );
                }
                if (panelId2 === panels[0][0]) {
                  onSplitterPositionChangeFinished(self.formScreen)(
                    xso.attributes.ModelInstanceId,
                    panel2SizeRatio
                  );
                }
              }}
              panels={panels as any[]}
            />
          );
        }
        case "VSplit": {
          const serverStoredValue = self.formScreen.getPanelPosition(xso.attributes.ModelInstanceId);
          const panelPositionRatio = serverValueToPanelSizeRatio(serverStoredValue);
          const panels = findUIChildren(xso).map((child, idx) => [
            idx,
            idx === 0 ? panelPositionRatio : 1 - panelPositionRatio,
            recursive(child),
          ]);
          return (
            <Splitter
              key={xso.$iid}
              STYLE={SSplitter}
              type="isVert"
              id={xso.attributes.ModelInstanceId}
              onSizeChangeFinished={(
                panelId1: any,
                panelId2: any,
                panel1SizeRatio: number,
                panel2SizeRatio: number
              ) => {
                if (panelId1 === panels[0][0]) {
                  onSplitterPositionChangeFinished(self.formScreen)(
                    xso.attributes.ModelInstanceId,
                    panel1SizeRatio
                  );
                }
                if (panelId2 === panels[0][0]) {
                  onSplitterPositionChangeFinished(self.formScreen)(
                    xso.attributes.ModelInstanceId,
                    panel2SizeRatio
                  );
                }
              }}
              panels={panels as any[]}
            />
          );
        }
        case "Label":
          console.log(xso);
          return (
            <Label
              key={xso.$iid}
              height={parseInt(xso.attributes.Height, 10)}
              text={xso.attributes.Name}
            />
          );
        case "VBox":
          return (
            <VBox
              key={xso.$iid}
              height={xso.attributes.Height ? parseInt(xso.attributes.Height, 10) : undefined}
            >
              {findUIChildren(xso).map((child) => recursive(child))}
            </VBox>
          );
        case "HBox":
          return (
            <HBox
              key={xso.$iid}
              width={xso.attributes.Width ? parseInt(xso.attributes.Width, 10) : undefined}
            >
              {findUIChildren(xso).map((child) => recursive(child))}
            </HBox>
          );
        case "TreePanel":
        case "Grid":
          if (xso.attributes.ModelInstanceId !== "957390e8-fa5e-46ad-92d0-118a5d5f4b3d-FALSE") {
            const dataView = getDataViewById(self.formScreen, xso.attributes.Id);
            if (dataView) {
              dataViewMap.set(xso.attributes.Id, dataView);
            }
            return (
              <DataView
                key={xso.$iid}
                id={xso.attributes.Id}
                height={xso.attributes.Height ? parseInt(xso.attributes.Height, 10) : undefined}
                width={xso.attributes.Width ? parseInt(xso.attributes.Width, 10) : undefined}
                isHeadless={xso.attributes.IsHeadless === "true"}
              />
            );
          } else {
            return (
              <EmbeddedWebpage
                key={xso.$iid}
                id={xso.attributes.ModelInstanceId}
                height={xso.attributes.Height ? parseInt(xso.attributes.Height, 10) : undefined}
              />
            );
          }
        case "Tab":
          return (
            <CScreenSectionTabbedView
              key={xso.$iid}
              boxes={findBoxes(xso)}
              nextNode={recursive}
              dataViewMap={dataViewMap}
            />
          );
        case "Box":
          return <Box key={xso.$iid}>{findUIChildren(xso).map((child) => recursive(child))}</Box>;
        default:
          console.log("Unknown node:", xso);
          return null;
      }
    }

    const uiRoot = findUIRoot(this.props.xmlWindowObject);
    return recursive(uiRoot);
  }

  render() {
    return this.buildScreen();
  }
}
