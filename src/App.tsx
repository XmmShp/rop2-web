import React from 'react';
import { LazyRouteFunction, Navigate, Outlet, RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider, message, theme } from 'antd';
import { DashboardOutlined, ApartmentOutlined, FormOutlined, AuditOutlined } from '@ant-design/icons';
import { mapRecur, useDarkMode } from './utils';
import { MessageInstance } from 'antd/es/message/interface';

function getConsoleLoader(scope: string, file: string, props: object = {}): LazyRouteFunction<RouteObject> {
  return async () => {
    const { default: Component } = await import(`./console/${scope}/${file}.tsx`);
    return { element: <Component {...props} /> };
  }
}
export const consoleRoutes = mapRecur([
  {
    label: '仪表盘',
    title: '仪表盘',//折叠状态下悬浮显示提示文本
    path: 'dash',
    icon: <DashboardOutlined />,
    lazy: getConsoleLoader('dash', 'Dash')
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
    }, {
      label: '管理员',
      path: 'admin',
      lazy: getConsoleLoader('org', 'AdminManage')
    }]
  }, {
    label: '表单管理',
    path: 'form',
    icon: <FormOutlined />,
    element: <Outlet />,
    children: [{
      label: '概览',
      path: 'overview',
      lazy: getConsoleLoader('form', 'FormOverview')
    }, {
      label: '编辑表单',
      path: 'edit',
      lazy: getConsoleLoader('form', 'FormEdit')
    }]
  }, {
    label: '选拔',
    path: 'inspect',
    icon: <AuditOutlined />,
    element: <Outlet />,
    children: [
      {
        label: '答卷查看',
        path: 'answer',
        element: <></>,
      }, {
        label: '面试管理',
        path: 'interview',
        element: <></>,
      }
    ]
  }
], 'children', (v, stack) => { return { ...v, key: [...stack.map(v => v.path), v.path].join('/') } });
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
      lazy: getConsoleLoader('shared', 'ConsoleLayout', { routes: consoleRoutes })
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