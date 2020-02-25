import { CMain } from "gui02/connections/CMain";
import { flow } from "mobx";
import { Provider } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";
import "react-tippy/dist/tippy.css";
import "./index.scss";
import { createApplication } from "./model/factories/createApplication";
import * as serviceWorker from "./serviceWorker";
import axios from "axios";
import { Root } from "Root";
import { ensureLogin, userManager } from "oauth";
import { getApi } from "model/selectors/getApi";

if (process.env.REACT_APP_SELENIUM_KICK) {
  axios.post("http://127.0.0.1:3500/app-reload");
}

if (process.env.NODE_ENV === "development") {
  axios.defaults.timeout = 3600000;
  (window as any).ORIGAM_CLIENT_AXIOS_LIB = axios;
}

(window as any).ORIGAM_CLIENT_REVISION_HASH = process.env.REACT_APP_GIT_REVISION_HASH || "UNKNOWN";
(window as any).ORIGAM_CLIENT_REVISION_DATE = process.env.REACT_APP_GIT_REVISION_DATE || "UNKNOWN";

async function main() {
  const user = await ensureLogin();
  if (user) {
    const application = createApplication();
    getApi(application).setAccessToken(user.access_token);
    sessionStorage.setItem('origamAuthToken', user.access_token);
    userManager.events.addUserLoaded(user => {
      getApi(application).setAccessToken(user.access_token);
      sessionStorage.setItem('origamAuthToken', user.access_token);
    });
    flow(application.run.bind(application))();

    ReactDOM.render(<Root application={application} />, document.getElementById("root"));
  } else {
    // TODO: ???
  }
}

main();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
