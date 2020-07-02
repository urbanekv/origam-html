import {FormScreenBuilder} from "gui/Workbench/ScreenArea/FormScreenBuilder";
import {observer, Provider} from "mobx-react";
import {IOpenedScreen} from "model/entities/types/IOpenedScreen";
import React, {useEffect, useState} from "react";
import {Screen} from "../components/Screen/Screen";
import {CtxPanelVisibility} from "gui02/contexts/GUIContexts";
import {WebScreen} from "gui02/components/WebScreen/WebScreen";
import {IWebScreen} from "model/entities/types/IWebScreen";
import {getIsTopmostNonDialogScreen} from "model/selectors/getIsTopmostNonDialogScreen";

const WebScreenComposite: React.FC<{ openedScreen: IOpenedScreen }> = observer((props) => {
  const { openedScreen } = props;
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    if (openedScreen.screenUrl) {
      setLoading(true);
    }
  }, []);
  return (
    <Screen isHidden={!getIsTopmostNonDialogScreen(openedScreen)}>
      <WebScreen
        url={openedScreen.screenUrl || ""}
        isLoading={isLoading}
        onLoad={(event: any) => {
          if (event.target.contentDocument.title) {
            ((openedScreen as unknown) as IWebScreen).setTitle(event.target.contentDocument.title);
          }
          setLoading(false);
        }}
        refIFrame={(elm: any) => {
          ((openedScreen as unknown) as IWebScreen).setReloader(
            elm
              ? {
                  reload: () => {
                    setLoading(true);
                    elm.contentWindow.location.reload();
                  },
                }
              : null
          );
        }}
      />
    </Screen>
  );
});

@observer
export class CScreen extends React.Component<{
  openedScreen: IOpenedScreen;
}> {
  render() {
    const { openedScreen } = this.props;
    if (openedScreen.screenUrl) {
      return <WebScreenComposite openedScreen={openedScreen} />;
    }
    if (!openedScreen.content) return null;
    const formScreen = openedScreen.content;
    return !formScreen.isLoading ? (
      <Provider key={formScreen.formScreen!.screenUI.$iid} formScreen={formScreen}>
        <>
          <Screen isHidden={!getIsTopmostNonDialogScreen(openedScreen)}>
            <CtxPanelVisibility.Provider
              value={{ isVisible: getIsTopmostNonDialogScreen(openedScreen) }}
            >
              <FormScreenBuilder xmlWindowObject={formScreen.formScreen!.screenUI} />
            </CtxPanelVisibility.Provider>
          </Screen>
        </>
      </Provider>
    ) : null;
  }
}
