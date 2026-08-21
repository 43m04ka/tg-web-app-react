import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './app/App';
import {initVk} from './shared/lib/vk';
import {configureTelegramViewport} from './shared/lib/telegram';
import {startInsets} from './shared/lib/insets';

initVk();
configureTelegramViewport();
startInsets();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>
);
