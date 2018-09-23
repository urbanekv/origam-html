import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { configure } from 'mobx';
import { reactionRuntimeInfo } from './utils/reaction';

configure({
  computedRequiresReaction: true,
  reactionScheduler(fn) {
    fn();
    reactionRuntimeInfo.clear();
  }
});


ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

