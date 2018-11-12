import React from 'react';
import ReactDOM from 'react-dom';
import '../node_modules/sanitize.css/sanitize.css';
import './index.css';
import App from './App';
import {
  setupGA
} from './helpers';
import * as serviceWorker from './serviceWorker';

setupGA();

ReactDOM.render( < App / > , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
