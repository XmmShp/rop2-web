import React from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider, message, theme } from 'antd';
import { DashboardOutlined, ApartmentOutlined, FormOutlined, AuditOutlined } from '@ant-design/icons';
import { mapRecur, useDarkMode } from './utils';
import { MessageInstance } from 'antd/es/message/interface';

export const consoleRoutes = mapRecur([
  {
    label: '仪表盘',
    title: '仪表盘',
    path: 'dash',
    icon: <DashboardOutlined />,
    element: <div>仪表盘</div>
  }, {
    label: '组织管理',
    path: 'org',
    icon: <ApartmentOutlined />,
    element: <Outlet />,
    children: [{
      label: '部门',
      path: 'department',
      async lazy() {
        const { default: Component } = await import('./console/DepartmentManage');
        return { element: <Component /> };
      }
    }, {
      label: '阶段',
      path: 'stage',
      async lazy() {
        const { default: Component } = await import('./console/StageManage');
        return { element: <Component /> };
      }
    }, {
      label: '管理员',
      path: 'admin',
      element: <></>
    }]
  }, {
    label: '表单管理',
    path: 'form',
    icon: <FormOutlined />,
    element: <Outlet />,
    children: [{
      label: '概览',
      path: 'overview',
      element: <></>,
    }, {
      label: '编辑表单',
      path: 'edit',
      element: <></>,
    }]
  }, {
    label: '候选人审查',
    path: 'inspect',
    icon: <AuditOutlined />,
    element: <Outlet />,
    children: [
      {
        label: '概览',
        path: 'overview',
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
      async lazy() {
        const { default: Component } = await import('./console/ConsoleLayout');
        return { element: <Component routes={consoleRoutes} /> };
      }
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