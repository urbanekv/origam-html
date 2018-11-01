import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import App from './App-ScreendefXml';
import './index.css';
import { configure } from 'mobx';
import { reactionRuntimeInfo } from './utils/reaction';

import {main} from './screenInterpreter/interpreter';

 main();

configure({
  computedRequiresReaction: true,
  reactionScheduler(fn) {
    fn();
    reactionRuntimeInfo.clear();
  }
});

/*
ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
*/
