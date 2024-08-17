import React from "react";
import { createRoot } from 'react-dom/client';

import "react-toastify/dist/ReactToastify.css";

import { store } from "./app/store";
import { Provider } from "react-redux";

import "./index.css";
import App from "./app/App";
import { configure_firebase } from "./app/firebase";

configure_firebase();

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
