import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from './App';
import './utils';//拓展原型
import './index.scss';
import { login } from './api/auth';

//TODO 测试用，须调整登录时机
await login('N/A').then(async (resp) => {
  if (resp.status == 300) {
    //如果有多个组织，登录第一个
    const [{ orgId }] = await resp.json();
    return login('N/A', orgId)
  }
}, console.error/**捕获错误 */);

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(<React.StrictMode><MyApp /></React.StrictMode>)