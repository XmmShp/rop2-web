import React, { ComponentProps, ReactNode, useState } from 'react';
import {
  LazyRouteFunction,
  LoaderFunction,
  Navigate,
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import {
  DashboardOutlined,
  ApartmentOutlined,
  FormOutlined,
  BarsOutlined,
  IdcardOutlined,
  FundViewOutlined,
  MessageOutlined,
  FunnelPlotOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { basename, useDarkMode } from './utils';
import { useAppProps } from 'antd/es/app/context';
import { getApiUrl } from './api/core.ts';

function getConsoleLoader<C extends keyof typeof import('./console/index.ts'), M extends typeof import('./console/index.ts')[C]>(
  comName: C,
  props: ComponentProps<M> = {} as any
): LazyRouteFunction<RouteObject> {
  return async () => {
    const { [comName]: Component } = await import('./console/index.ts');
    const { loader } = Component as { loader?: LoaderFunction };
    return { element: <Component {...(props as any)} />, loader };
  };
}

//注：有label的会显示在侧边菜单中，否则仅有路由
export const consoleRoutes = [
  {
    path: '',
    index: true,
    element: <Navigate to="dash" />,
  },
  {
    label: '仪表盘',
    path: 'dash',
    icon: <DashboardOutlined />,
    lazy: getConsoleLoader('Dash'),
  },
  {
    label: '报名表',
    path: 'form',
    icon: <FormOutlined />,
    lazy: getConsoleLoader('FormOverview'),
  },
  {
    path: 'form/edit/:formId?',
    lazy: getConsoleLoader('FormEdit'),
  },
  {
    label: '候选人',
    path: 'result/:formId?',
    icon: <BarsOutlined />,
    lazy: getConsoleLoader('ResultOverview'),
  },
  {
    label: '面试',
    path: 'interview',
    icon: <FundViewOutlined />,
    lazy: getConsoleLoader('InterviewManage'),
  },
  {
    path: 'interview/schedule/:interviewId',
    lazy: getConsoleLoader('ScheduleList'),
  },
  {
    // label: '通知', 没做先隐藏
    path: 'message',
    icon: <MessageOutlined />,
    lazy: getConsoleLoader('MessageManage'),
  },
  {
    // label: '阶段',
    path: 'stage',
    icon: <FunnelPlotOutlined />,
    lazy: getConsoleLoader('StageManage'),
  },
  {
    label: '管理员',
    path: 'admin',
    icon: <IdcardOutlined />,
    lazy: getConsoleLoader('AdminManage'),
  },
  {
    label: '部门',
    path: 'depart',
    icon: <ApartmentOutlined />,
    lazy: getConsoleLoader('DepartManage'),
  },
  {
    label: '帮助和反馈',
    href: 'https://ccnqoieaz7g3.feishu.cn/wiki/ZHE9wymdritwURkZwlAcmnaYnrd',
    icon: <QuestionCircleOutlined />,
  },
].map((v) => {
  return { ...v, title: v.label, key: v.path ?? v.href };
});

function ErrorElement() {
  const error = useRouteError();
  console.error(error);
  const isRouteError = isRouteErrorResponse(error);
  if (isRouteError && error.status === 404) return <>404 Not Found</>;
  return (
    <>
      Oops, an unhandled error was thrown
      <br />
      Check devtools for more info
      <br />
      <pre>{String(error)}</pre>
    </>
  );
}
function MultipleChoices() {
  //TODO 优化UI
  const search = new URLSearchParams(location.search);
  const choices = JSON.parse(search.get('choices')!) as {
    orgId: number;
    orgName: string;
  }[];
  const sessionToken = search.get('SESSION_TOKEN')!;
  const continueUrl = search.get('continue')!;
  return (
    <div>
      您在多个组织内具有管理权限。
      <br />
      请选择要登录的组织（登录后可点击右上角头像退出）：
      {choices.map(({ orgId, orgName }) => (
        <div key={orgId}>
          <a
            href={getApiUrl('/loginByPassportToken', {
              orgId: orgId.toString(),
              continue: continueUrl,
              SESSION_TOKEN: sessionToken,
            })}
          >
            {orgName}
          </a>
        </div>
      ))}
    </div>
  );
}
const router = createBrowserRouter(
  [
    {
      path: '/',
      errorElement: <ErrorElement />,
      children: [
        { index: true, element: <Navigate to="/console" /> },
        {
          path: 'console',
          children: consoleRoutes.filter((v) => 'path' in v), //有href属性的为外部链接，不创建route
          lazy: getConsoleLoader('ConsoleLayout', {
            routes: consoleRoutes
              //没有label的只做路由，不在导航菜单中显示
              .filter((v) => 'label' in v)
              //不传递lazy等参数防止渲染报错
              .map((v) => {
                return { ...v, lazy: undefined, path: undefined };
              }),
          }),
        },
        {
          path: 'apply/:formId',
          async lazy() {
            const { default: Component } = await import('./apply/ApplyForm.tsx');
            return { element: <Component /> };
          },
        },
        {
          path: 'status/:formId',
          async lazy() {
            const { default: Component } = await import('./status/StatusPage.tsx');
            return { element: <Component /> };
          },
        },
        {
          path: 'login/choice',
          element: <MultipleChoices />,
        },
      ],
    },
  ],
  {
    //给react-router提供basename
    //影响react-router组件，antd的href要手动加上basename
    basename,
  }
);

export let setAppTempNode: React.Dispatch<React.SetStateAction<React.ReactNode>>;
export default function MyApp() {
  const isDark = useDarkMode();
  const [tempNode, setTempNode] = useState<ReactNode>(<></>);
  setAppTempNode = setTempNode;
  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        cssVar: true,
        hashed: false,
      }}
    >
      <AntdApp className="app">
        <AppContextUser />
        <RouterProvider router={router} />
        {tempNode}
      </AntdApp>
    </ConfigProvider>
  );
}

export let message: useAppProps['message'], notification: useAppProps['notification'], modal: useAppProps['modal'];
/**此FC用于读取Context并使用antd的hook */
function AppContextUser() {
  ({ message, notification, modal } = AntdApp.useApp());
  return <></>;
}
