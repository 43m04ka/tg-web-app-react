import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './app/App';
import {initVk} from './shared/lib/vk';
import {loadTelegramScript} from './shared/lib/telegram';

initVk();
loadTelegramScript().catch((error) => console.error('[index]', error.message));

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>
);
