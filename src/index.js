import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import {BrowserRouter} from "react-router-dom";
import vkBridge from '@vkontakte/vk-bridge';

const root = ReactDOM.createRoot(document.getElementById('root'));
vkBridge.send("VKWebAppInit");


root.render(
  <React.StrictMode>
      <BrowserRouter>
          <App/>
      </BrowserRouter>
  </React.StrictMode>
);
