import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from './App';
import './index.scss';
import { saveToken, tokenKey } from './api/core';

const search = new URLSearchParams(location.search);
const ropToken = search.get(tokenKey);
if (ropToken?.length) {
  saveToken(ropToken);
  search.delete(tokenKey);
  location.search = search.toString();//更新search会刷新页面
} else
  //未登录时跳转到登录页的逻辑由各页面自行处理。无论登录与否都渲染App
  //目前负责提示/跳转登录的组件：
  // ConsoleLayout(控制台下都无需再处理登录逻辑，如果访问API /org报403，也会提醒需要权限)
  // ApplyForm 渲染提示后跳转到登录页
  ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(<React.StrictMode><MyApp /></React.StrictMode>)