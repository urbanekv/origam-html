import S from "./ScreenArea.module.css";
import FSS from "./FormScreen.module.css";

import React from "react";
import { observer } from "mobx-react";
import { action, observable } from "mobx";
import {
  ModalWindowOverlay,
  ModalWindow
} from "../../Components/Dialog/Dialog";
import { FormScreen } from "./FormScreen";
import { VBox } from "../../Components/ScreenElements/VBox";
import {
  TabbedPanel,
  TabBody,
  TabHandle
} from "../../Components/ScreenElements/TabbedPanel";
import { VSplit, VSplitPanel } from "../../Components/ScreenElements/VSplit";
import { HSplit, HSplitPanel } from "../../Components/ScreenElements/HSplit";
import { FormScreenBuilder } from "./FormScreenBuilder";
import axios from "axios";
import xmlJs from "xml-js";
import { ColumnsDialog } from "../../Components/Dialogs/ColumnsDialog";

@observer
class MainViewHandle extends React.Component<{
  order: number;
  label: string;
  isActive: boolean;
  onClick?: (event: any, menuItemId: string, order: number) => void;
  onCloseClick?: (event: any, menuItemId: string, order: number) => void;
}> {
  render() {
    return (
      <div
        className={S.TabHandle + (this.props.isActive ? ` ${S.active}` : "")}
        onClick={undefined}
      >
        {this.props.label}
        {this.props.order > 0 ? ` [${this.props.order}] ` : ""}
        <button className={S.TabHandleCloseBtn} onClick={undefined}>
          <i className="fas fa-times" />
        </button>
      </div>
    );
  }
}

@observer
export class ScreenArea extends React.Component {
  @observable.ref testingScreen: any = undefined;

  async componentDidMount() {
    const resp = await axios.get("/screen05.xml");
    const screenDoc = xmlJs.xml2js(resp.data, {
      addParent: true,
      alwaysChildren: true
    });
    console.log(screenDoc);
    this.testingScreen = screenDoc;
  }

  render() {
    return (
      <div className={S.Root}>
        {/*<ColumnsDialog />*/}
        {/*<ModalWindowOverlay>
          <ModalWindow
            title="Columns"
            buttonsCenter={
              <>
                <button>OK</button>
                <button>Save As...</button>
                <button>Cancel</button>
              </>
            }
            buttonsLeft={null}
            buttonsRight={null}
          >
            <div className
          </ModalWindow>
          </ModalWindowOverlay>*/}

        <div className={S.TabHandles}>
          <MainViewHandle label={"Tab 1"} order={3} isActive={false} />
          <MainViewHandle label={"Tab 2"} order={0} isActive={false} />
          <MainViewHandle label={"Tab 3"} order={1} isActive={true} />
        </div>

        <FormScreen
          isLoading={false}
          isVisible={true}
          isFullScreen={false}
          title={"Testing screen"}
          isSessioned={false}
        >
          {/*<VBox>
            <VBox height={32}>area1</VBox>
            <TabbedPanel
              handles={[
                <TabHandle isActive={false} label={"Tab A"} />,
                <TabHandle isActive={true} label={"Tab B"} />,
                <TabHandle isActive={false} label={"Tab C"} />
              ]}
            >
              <TabBody isActive={true}>
                <VSplit handleClassName={FSS.splitterHandle}>
                  <VSplitPanel id="1">Panel1</VSplitPanel>
                  <VSplitPanel id="2">
                    <HSplit handleClassName={FSS.splitterHandle}>
                      <HSplitPanel id="1">Panel21</HSplitPanel>
                      <HSplitPanel id="2">Panel22</HSplitPanel>
                    </HSplit>
                  </VSplitPanel>
                </VSplit>
              </TabBody>
            </TabbedPanel>
            </VBox>*/}

          {this.testingScreen && (
            <FormScreenBuilder xmlWindowObject={this.testingScreen} />
          )}
        </FormScreen>
      </div>
    );
  }
}
