import { BankOutlined, DashboardOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Navigate, RouteObject, useLocation, useNavigate } from 'react-router-dom';
import { Mutable } from '../utils';

const paths = [{
  label: '仪表盘',
  path: 'dash',
  icon: <DashboardOutlined />,
  element: <></>
}, {
  label: '组织管理',
  path: 'org',
  icon: <BankOutlined />,
  element: <></>,
  children: [{
    label: '组织管理',
    path: 'overview',
  }, {
    label: '部门管理',
    path: 'department',
  }]
}].map((v, i) => mapKeyIndex(v, i));
export const consoleRoute = {
  path: 'console',
  element: <ConsoleLayout />,
  children: paths
} satisfies RouteObject;

function ConsoleLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { groups } = pathname.match(/^\/console\/(?<func>(\w|\/)+)(?<!\/)\??/) ?? {};
  const selectedIndex = paths.find((v) => v.path === groups?.func)?.key;
  if (!selectedIndex) return <Navigate to='dash' />;
  return (<Layout style={{ minHeight: '100vh' }}>
    <Layout.Sider collapsible>
      <Menu theme='dark' selectedKeys={[selectedIndex]} mode="inline"
        onClick={(info) => navigate(getPath(info.key))}
        items={paths} />
    </Layout.Sider>
  </Layout>)
}

function getPath(key: string) {
  let cur: any = { children: paths };
  const parts = key.split('-');
  const ps: string[] = [];
  for (const p of parts) {
    cur = cur.children[Number(p)];
    ps.push(cur.path);
  }
  return ps.join('/');
}

function mapKeyIndex<T extends { children: object[] } | {}>(from: T, index: number, prefix = ''): T & { key: string } {
  const thisKey = prefix + index.toString();
  const result = { ...from, key: thisKey };
  if ('children' in from) {
    (result as any).children = from.children!.map((v, i) => mapKeyIndex(v, i, thisKey + '-'));
  }
  return result;
}