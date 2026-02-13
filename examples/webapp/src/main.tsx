// Import polyfills first!
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { S402Provider } from '@s402/react';
import App from './App';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <S402Provider network="mainnet-beta">
        <App />
      </S402Provider>
    </BrowserRouter>
  </React.StrictMode>
);
