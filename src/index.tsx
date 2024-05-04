import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from './App';
import './utils';//拓展原型
import './index.scss';
import { adminLogin } from './api/auth';

//TODO 测试用，须调整登录时机
adminLogin('N/A').then(async (resp) => {
  if (resp.status == 300) {
    //如果有多个组织，登录第一个
    const [{ orgId }] = await resp.json();
    return adminLogin('N/A', orgId)
  }
}, console.error/**捕获错误 */).then(() => ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(<React.StrictMode><MyApp /></React.StrictMode>))
//Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
//TODO: 不考虑兼容性?