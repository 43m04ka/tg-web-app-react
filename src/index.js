import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from "react-router-dom";

const express = require('express');

const PORT = 17405;

const app = express();

app.get('/', (req, res) => {res.send('123')})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <React.StrictMode>
      <BrowserRouter>
          <App />
      </BrowserRouter>
  </React.StrictMode>
);
