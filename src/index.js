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

function loadTelegramScript(timeout = 3000) {
  return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org';
      
      const timer = setTimeout(() => {
          script.src = ''; 
          script.remove();
          reject(new Error('Превышено время ожидания загрузки Telegram API'));
      }, timeout);

      script.onload = () => {
          clearTimeout(timer);
          resolve(window.Telegram);
      };
      
      script.onerror = () => {
          clearTimeout(timer);
          reject(new Error('Не удалось загрузить скрипт'));
      };

      document.head.appendChild(script);
  });
}

loadTelegramScript(3000)
  .then(() => {
      console.log('Telegram API готов к работе');
      window.Telegram.WebApp.ready(); 
  })
  .catch(err => {
      console.error(err.message);
  });
