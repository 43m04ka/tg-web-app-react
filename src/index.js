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


function loadTelegramScript() {
    return new Promise((resolve, reject) => {
        
        if (window.Telegram?.WebApp) {
            return resolve(window.Telegram);
        }

        const script = document.createElement('script');
        
        script.onload = () => {
            console.log('Локальный скрипт УСПЕШНО загружен в DOM.');
            resolve(window.Telegram);
        };
        
        script.onerror = () => {
            reject(new Error('Не удалось загрузить локальный скрипт Telegram'));
        };
        
        script.src = '/telegram-web-app.js'; 
        document.head.appendChild(script);
    });
}

loadTelegramScript();
