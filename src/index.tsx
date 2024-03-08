import React from 'react';
import './index.scss';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils';//拓展原型
import { forms, org } from './mockData';

//TODO 登录时获取defaultOrg defaultForm
localStorage.setItem('defaultOrg', org.id.toString());
localStorage.setItem('defaultForm', forms[0].id.toString());


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)