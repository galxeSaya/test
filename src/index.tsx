import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 移除文件扩展名

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
