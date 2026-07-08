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
        console.log('[DEBUG 1] Вызов loadTelegramScript. Проверяем наличие объекта:', !!window.Telegram);
        
        if (window.Telegram?.WebApp) {
            console.log('[DEBUG 1] Telegram уже был в окне, ресолвим.');
            return resolve(window.Telegram);
        }

        const script = document.createElement('script');
        
        script.onload = () => {
            console.log('[DEBUG 1] Локальный скрипт УСПЕШНО загружен в DOM. window.Telegram:', !!window.Telegram);
            resolve(window.Telegram);
        };
        
        script.onerror = (err) => {
            console.error('[DEBUG 1] ❌ КРИТИЧЕСКАЯ ОШИБКА загрузки файла /telegram-web-app.js с сервера!', err);
            reject(new Error('Не удалось загрузить локальный скрипт Telegram'));
        };
        
        script.src = '/telegram-web-app.js'; 
        document.head.appendChild(script);
        console.log('[DEBUG 1] Тег script добавлен в head, ждем загрузки файла...');
    });
}

loadTelegramScript();
