import React, { ComponentProps, ReactNode, useState } from 'react';
import { LazyRouteFunction, LoaderFunction, Navigate, RouteObject, RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { DashboardOutlined, ApartmentOutlined, FormOutlined, BarsOutlined, IdcardOutlined, FundViewOutlined, MessageOutlined, FunnelPlotOutlined } from '@ant-design/icons';
import { basename, useDarkMode } from './utils';
import { useAppProps } from 'antd/es/app/context';

function getConsoleLoader<C extends keyof typeof import('./console/index.ts'), M extends typeof import('./console/index.ts')[C]>(comName: C, props: ComponentProps<M> = {} as any): LazyRouteFunction<RouteObject> {
  return async () => {
    const { [comName]: Component } = await import('./console/index.ts');
    const { loader } = Component as { loader?: LoaderFunction };
    return { element: (<Component {...props as any} />), loader };
  }
}
//注：有label的会显示在侧边菜单中，否则仅有路由
export const consoleRoutes = [
  {
    label: '仪表盘',
    path: 'dash',
    icon: <DashboardOutlined />,
    lazy: getConsoleLoader('Dash')
  }, {
    label: '表单',
    path: 'form',
    icon: <FormOutlined />,
    lazy: getConsoleLoader('FormOverview')
  }, {
    path: 'form/edit',
    lazy: getConsoleLoader('FormEdit')
  }, {
    label: '报名表',
    path: 'result',
    icon: <BarsOutlined />,
    lazy: getConsoleLoader('ResultOverview')
  }, {
    label: '面试',
    path: 'interview',
    icon: <FundViewOutlined />,
    lazy: getConsoleLoader('InterviewManage')
  }, {
    label: '通知模板',
    path: 'template',
    icon: <MessageOutlined />,
    lazy: getConsoleLoader('TemplateManage')
  }, {
    label: '阶段',
    path: 'stage',
    icon: <FunnelPlotOutlined />,
    lazy: getConsoleLoader('StageManage')
  }, {
    label: '管理员',
    path: 'admin',
    icon: <IdcardOutlined />,
    lazy: getConsoleLoader('AdminManage')
  }, {
    label: '部门',
    path: 'depart',
    icon: <ApartmentOutlined />,
    lazy: getConsoleLoader('DepartManage')
  },
].map(v => { return { ...v, title: v.label, key: v.path } });

function ErrorElement() {
  console.error(useRouteError());
  return <>Oops, an error occurred<br />Check devtools for more info</>;
}
const router = createBrowserRouter([{
  path: '/',
  errorElement: <ErrorElement />,
  children: [
    {
      index: true,
      element: <Navigate to='/console' />
    }, {
      path: 'console',
      children: consoleRoutes,
      lazy: getConsoleLoader('ConsoleLayout', { routes: consoleRoutes.filter(v => 'label' in v) })
    }, {
      path: 'apply/:id',
      async lazy() {
        const { default: Component } = await import('./apply/ApplyForm.tsx');
        return { element: <Component /> }
      }
    }, {
      path: 'my/profile',
      async lazy() {
        const { default: Component } = await import('./my/Profile.tsx');
        return { element: <Component /> }
      }
    }
  ]
}], {
  basename
});

export let setAppTempNode: React.Dispatch<React.SetStateAction<React.ReactNode>>;
export default function MyApp() {
  const isDark = useDarkMode();
  const [tempNode, setTempNode] = useState<ReactNode>(<></>);
  setAppTempNode = setTempNode;
  return (<ConfigProvider theme={{
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    cssVar: true,
    hashed: false
  }}>
    <AntdApp className='app'>
      <AppContextUser />
      <RouterProvider router={router} />
      {tempNode}
    </AntdApp>
  </ConfigProvider>);
}

export let message: useAppProps['message'], notification: useAppProps['notification'], modal: useAppProps['modal'];
/**此FC用于读取Context并使用antd的hook */
function AppContextUser() {
  ({ message, notification, modal } = AntdApp.useApp());
  return (<></>);
}