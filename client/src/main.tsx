import React from "react";
import { createRoot } from 'react-dom/client';

import "react-toastify/dist/ReactToastify.css";

import { store } from "./app/store";
import { Provider } from "react-redux";

import "./index.css";
import App from "./app/App";

import { registerSW } from "virtual:pwa-register";

// add this to prompt for a refresh
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  // </React.StrictMode>
);
