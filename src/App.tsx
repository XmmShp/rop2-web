import React from 'react';
import { LazyRouteFunction, Navigate, Outlet, RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider, message, theme } from 'antd';
import { DashboardOutlined, ApartmentOutlined, FormOutlined, AuditOutlined, BarsOutlined, IdcardOutlined, FundViewOutlined } from '@ant-design/icons';
import { mapRecur, useDarkMode } from './utils';
import { MessageInstance } from 'antd/es/message/interface';

function getConsoleLoader(scope: string, file: string, props: object = {}): LazyRouteFunction<RouteObject> {
  return async () => {
    const { default: Component } = await import(`./console/${scope}/${file}.tsx`);
    return { element: <Component {...props} /> };
  }
}
//注：有label的会显示在侧边菜单中，否则仅有路由
export const consoleRoutes = mapRecur([
  {
    label: '仪表盘',
    path: 'dash',
    icon: <DashboardOutlined />,
    lazy: getConsoleLoader('dash', 'Dash')
  }, {
    label: '答卷分析',
    path: 'result',
    icon: <BarsOutlined />,
    element: <></>,
  }, {
    label: '面试管理',
    path: 'interview',
    icon: <FundViewOutlined />,
    element: <></>,
  }, {
    label: '表单管理',
    path: 'form',
    icon: <FormOutlined />,
    lazy: getConsoleLoader('form', 'FormOverview')
  }, {
    path: 'form/edit',
    lazy: getConsoleLoader('form', 'FormEdit')
  }, {
    label: '用户管理',
    path: 'user',
    icon: <IdcardOutlined />,
    lazy: getConsoleLoader('org', 'AdminManage')
  }, {
    label: '组织管理',
    path: 'org',
    icon: <ApartmentOutlined />,
    element: <Outlet />,
    children: [{
      label: '部门',
      path: 'department',
      lazy: getConsoleLoader('org', 'DepartmentManage')
    }, {
      label: '阶段',
      path: 'stage',
      lazy: getConsoleLoader('org', 'StageManage')
    }]
  }
], 'children', (v, stack) => { return { ...v, key: [...stack.map(v => v.path), v.path].join('/') } })
  .map(v => { return { ...v, title: v.label } });
const router = createBrowserRouter([{
  path: '/',
  errorElement: <>Oops, an error occurred<br />Check devtools for more info</>,
  children: [
    {
      index: true,
      element: <Navigate to='/console' />
    }, {
      path: 'console',
      children: consoleRoutes,
      lazy: getConsoleLoader('shared', 'ConsoleLayout', { routes: consoleRoutes.filter(v => 'label' in v) })
    }
  ]
}]);

export let msg: MessageInstance;
export default function App() {
  const isDark = useDarkMode();
  const [messageApi, contextHolder] = message.useMessage();
  msg = messageApi;
  return (<React.StrictMode>
    <ConfigProvider theme={{
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      cssVar: true,
      hashed: false
    }}>
      {contextHolder}
      <RouterProvider router={router} /></ConfigProvider>
  </React.StrictMode>);
}