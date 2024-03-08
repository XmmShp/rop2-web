import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils';//拓展原型
import { forms, org } from './mockData';
import './index.scss';

//TODO 登录时获取defaultOrg defaultForm userNickname
localStorage.setItem('defaultOrg', org.id.toString());
localStorage.setItem('defaultForm', forms[0].id.toString());
localStorage.setItem('userNickname', 'test');

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(<App />)