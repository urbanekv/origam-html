import { Provider } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";
import { Main } from "./gui/Main";
import "./index.css";
import { createApplication } from "./model/factories/createApplication";
import * as serviceWorker from "./serviceWorker";
import 'react-tippy/dist/tippy.css'

const application = createApplication();
application.run();

ReactDOM.render(
  <Provider application={application}>
    <Main />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
  


