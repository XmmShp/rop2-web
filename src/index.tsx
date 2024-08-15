import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from './App';
import './utils';//拓展原型
import './index.scss';
import { saveToken } from './api/core';
import { kvGet } from './store/kvCache';
import { redirectToLogin } from './api/auth';

const search = new URLSearchParams(location.search);
const ropToken = search.get('ropToken');
if (ropToken) {
  saveToken(ropToken);
  search.delete('ropToken');
  location.search = search.toString();
} else {
  if (!kvGet('token')
    //部分页面不需要登录
    && !/^\/login\/choice/.test(location.pathname))
    redirectToLogin();
  else
    ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(<React.StrictMode><MyApp /></React.StrictMode>)
}