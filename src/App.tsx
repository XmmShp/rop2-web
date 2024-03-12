import React, { ReactNode, useState } from 'react';
import { LazyRouteFunction, Navigate, RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { DashboardOutlined, ApartmentOutlined, FormOutlined, BarsOutlined, IdcardOutlined, FundViewOutlined } from '@ant-design/icons';
import { mapRecur, useDarkMode } from './utils';
import { useAppProps } from 'antd/es/app/context';

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
    lazy: getConsoleLoader('org', 'OrgManage')
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

export let setAppTempNode: React.Dispatch<React.SetStateAction<React.ReactNode>>;
export default function MyApp() {
  const isDark = useDarkMode();
  const [tempNode, setTempNode] = useState<ReactNode>(<></>);
  setAppTempNode = setTempNode;
  return (<React.StrictMode>
    <ConfigProvider theme={{
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      cssVar: true,
      hashed: false
    }}>
      <AntdApp>
        <AppContextUser />
        <RouterProvider router={router} />
        {tempNode}
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>);
}

export let message: useAppProps['message'], notification: useAppProps['notification'], modal: useAppProps['modal'];
/**此FC用于读取Context并使用antd的hook */
function AppContextUser() {
  ({ message, notification, modal } = AntdApp.useApp());
  return (<></>);
}