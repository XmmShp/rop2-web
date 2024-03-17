import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from './App';
import './utils';//拓展原型
import './index.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(<React.StrictMode><MyApp /></React.StrictMode>)